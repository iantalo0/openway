package web3

import (
	"crypto/ecdsa"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"github.com/rs/zerolog/log"
)

// Signer handles EIP-712 cryptographic signing for the Relayer.
type Signer struct {
	privateKey *ecdsa.PrivateKey
	address    common.Address
	chainID    *big.Int
	domain     apitypes.TypedDataDomain
	types      apitypes.Types
}

// NewSigner initializes the Web3 signer from a hex-encoded private key.
func NewSigner(privKeyHex string, chainID int64, contractAddress string) (*Signer, error) {
	privateKey, err := crypto.HexToECDSA(privKeyHex)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("error casting public key to ECDSA")
	}

	address := crypto.PubkeyToAddress(*publicKeyECDSA)
	log.Info().Str("address", address.Hex()).Msg("relayer signer initialized")

	domain := apitypes.TypedDataDomain{
		Name:              "OpenwayEscrow",
		Version:           "1",
		ChainId:           math.NewHexOrDecimal256(chainID),
		VerifyingContract: contractAddress,
	}

	types := apitypes.Types{
		"EIP712Domain": {
			{Name: "name", Type: "string"},
			{Name: "version", Type: "string"},
			{Name: "chainId", Type: "uint256"},
			{Name: "verifyingContract", Type: "address"},
		},
		"ReleaseMessage": {
			{Name: "intentHash", Type: "bytes32"},
			{Name: "telcoReference", Type: "bytes32"},
		},
	}

	return &Signer{
		privateKey: privateKey,
		address:    address,
		chainID:    big.NewInt(chainID),
		domain:     domain,
		types:      types,
	}, nil
}

// Address returns the public address of the relayer.
func (s *Signer) Address() common.Address {
	return s.address
}

// SignReleaseMessage generates an EIP-712 signature for the ReleaseMessage struct.
// This exactly matches the _RELEASE_TYPEHASH in the EscrowRouter smart contract.
func (s *Signer) SignReleaseMessage(intentHash [32]byte, telcoReference [32]byte) ([]byte, error) {
	message := apitypes.TypedDataMessage{
		"intentHash":     intentHash[:],
		"telcoReference": telcoReference[:],
	}

	typedData := apitypes.TypedData{
		Types:       s.types,
		PrimaryType: "ReleaseMessage",
		Domain:      s.domain,
		Message:     message,
	}

	domainSepHash, err := typedData.HashStruct("EIP712Domain", typedData.Domain.Map())
	if err != nil {
		return nil, fmt.Errorf("failed to hash domain: %w", err)
	}

	msgHash, err := typedData.HashStruct(typedData.PrimaryType, typedData.Message)
	if err != nil {
		return nil, fmt.Errorf("failed to hash message: %w", err)
	}

	// Final EIP-712 digest: keccak256("\x19\x01" || domainSeparator || hashStruct(message))
	rawData := append([]byte("\x19\x01"), domainSepHash...)
	rawData = append(rawData, msgHash...)
	digest := crypto.Keccak256(rawData)

	sig, err := crypto.Sign(digest, s.privateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to sign digest: %w", err)
	}

	// Adjust V value for Ethereum standard (add 27)
	if sig[64] < 27 {
		sig[64] += 27
	}

	return sig, nil
}