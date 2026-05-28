package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"openway/internal/api"
	"openway/internal/config"
	"openway/internal/middleware"
	"openway/internal/repository"
	"openway/internal/telemetry"

	"github.com/rs/zerolog/log"
)

func methodRouter(methods map[string]http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		h, ok := methods[r.Method]
		if !ok {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		h(w, r)
	}
}

func corsMiddleware(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

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

	// Repositories
	settlementRepo := repository.NewSettlementRepository(pool)
	merchantRepo := repository.NewMerchantRepository(pool)
	userRepo := repository.NewUserRepository(pool)
	nodeRepo := repository.NewNodeRepository(pool)

	// Handlers
	authHandlers := api.NewAuthHandlers(userRepo)
	adminHandlers := api.NewAdminHandlers(settlementRepo, merchantRepo, nodeRepo)
	merchantHandlers := api.NewMerchantHandlers(merchantRepo, settlementRepo)
	regHandlers := api.NewRegistrationHandlers(userRepo, merchantRepo)
	nodeHandlers := api.NewNodeHandlers(nodeRepo)
	wsHub := api.NewWSHub()

	// Router
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Public auth routes
	mux.HandleFunc("/api/auth/register", methodRouter(map[string]http.HandlerFunc{
		http.MethodPost: regHandlers.HandleRegister,
	}))
	mux.HandleFunc("/api/auth/merchant", methodRouter(map[string]http.HandlerFunc{
		http.MethodPost: authHandlers.HandleMerchantAuth,
	}))
	mux.HandleFunc("/api/auth/admin", methodRouter(map[string]http.HandlerFunc{
		http.MethodPost: authHandlers.HandleAdminLogin,
	}))
	mux.HandleFunc("/api/auth/logout", methodRouter(map[string]http.HandlerFunc{
		http.MethodPost: authHandlers.HandleLogout,
	}))
	mux.HandleFunc("/api/auth/session", methodRouter(map[string]http.HandlerFunc{
		http.MethodGet: authHandlers.HandleSession,
	}))

	// Protected merchant routes
	merchantRouter := http.NewServeMux()
	merchantRouter.HandleFunc("/profile", merchantHandlers.GetProfile)
	merchantRouter.HandleFunc("/balance", merchantHandlers.GetBalance)
	merchantRouter.HandleFunc("/transactions", merchantHandlers.GetTransactions)
	mux.Handle("/api/v1/merchant/", middleware.JWTMiddleware(http.StripPrefix("/api/v1/merchant", merchantRouter)))

	// Protected admin routes
	adminRouter := http.NewServeMux()
	adminRouter.HandleFunc("/stats", adminHandlers.GetDashboardStats)
	adminRouter.HandleFunc("/transactions", adminHandlers.GetRecentTransactions)
	adminRouter.HandleFunc("/nodes", adminHandlers.GetNodes)
	adminRouter.HandleFunc("/merchants/top", adminHandlers.GetTopMerchants)
	mux.Handle("/api/v1/admin/", middleware.JWTMiddleware(http.StripPrefix("/api/v1/admin", adminRouter)))

	// Node routes (public health checks; heartbeat should be HMAC-protected in production)
	mux.HandleFunc("/api/v1/nodes", nodeHandlers.ListNodes)
	mux.HandleFunc("/api/v1/nodes/heartbeat", methodRouter(map[string]http.HandlerFunc{
		http.MethodPost: nodeHandlers.Heartbeat,
	}))

	// WebSocket
	mux.HandleFunc("/ws/escrows", wsHub.HandleUpgrade)

	// CORS: must specify exact origin when credentials=true
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	handler := corsMiddleware(frontendURL)(mux)

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.APIPort),
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Info().Int("port", cfg.APIPort).Str("frontend", frontendURL).Msg("api server starting")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("api server failed")
		}
	}()

	<-ctx.Done()
	log.Info().Msg("shutdown signal received, draining connections...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("server forced to shutdown")
	}
	log.Info().Msg("api server stopped gracefully")
}