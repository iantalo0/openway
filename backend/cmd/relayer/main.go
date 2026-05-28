package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"openway/internal/api"
	"openway/internal/config"
	"openway/internal/middleware"
	"openway/internal/queue"
	"openway/internal/repository"
	"openway/internal/service"
	"openway/internal/telemetry"
	"openway/internal/web3"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config error: %v\n", err)
		os.Exit(1)
	}

	telemetry.InitLogger(cfg.Env)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := repository.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to postgres")
	}
	defer pool.Close()

	redisOpt, err := asynq.ParseRedisURI(cfg.RedisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to parse redis uri")
	}

	queueClient := queue.NewRedisClient(redisOpt)
	defer queueClient.Close()

	signer, err := web3.NewSigner(cfg.RelayerPrivKey, 44787, "0x0000000000000000000000000000000000000000")
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialize web3 signer")
	}

	repo := repository.NewSettlementRepository(pool)
	svc := service.NewSettlementService(repo, queueClient)
	handlers := api.NewHandlers(svc, repo)

	worker := queue.NewSettlementWorker(repo, signer)
	bgServer := queue.NewBackgroundServer(redisOpt)
	go func() {
		if err := bgServer.Run(worker.RegisterHandlers()); err != nil {
			log.Fatal().Err(err).Msg("asynq worker crashed")
		}
	}()

	mux := http.NewServeMux()
	mux.Handle("/webhooks/daraja", middleware.HMACValidation(cfg.TelcoHMACKey)(http.HandlerFunc(handlers.HandleDarajaWebhook)))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.RelayerPort),
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Info().Int("port", cfg.RelayerPort).Msg("relayer server starting")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("relayer server failed")
		}
	}()

	<-ctx.Done()
	log.Info().Msg("shutdown signal received, draining connections...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	bgServer.Shutdown()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("server forced to shutdown")
	}
	log.Info().Msg("relayer server stopped gracefully")
}