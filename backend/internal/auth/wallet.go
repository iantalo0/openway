package auth

import (
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// VerifyWalletSignature validates EIP-191 personal_sign for merchant auth.
// The message must exactly match what was signed on the client side.
func VerifyWalletSignature(address, message, signatureHex string) bool {
	sig := common.FromHex(signatureHex)
	if len(sig) != 65 {
		return false
	}

	// Adjust V value: some wallets return 27/28, others 0/1
	if sig[64] >= 27 {
		sig[64] -= 27
	}

	// EIP-191 prefix: "\x19Ethereum Signed Message:\n" + len(message) + message
	prefix := fmt.Sprintf("\x19Ethereum Signed Message:\n%d", len(message))
	hash := crypto.Keccak256([]byte(prefix + message))

	pubKey, err := crypto.SigToPub(hash, sig)
	if err != nil {
		return false
	}

	recoveredAddr := crypto.PubkeyToAddress(*pubKey)
	return strings.EqualFold(recoveredAddr.Hex(), address)
}