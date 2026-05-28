// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrowRouter {
    struct EscrowIntent {
        address sender;
        address receiver;
        address token;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
        bytes32 telcoReference;
    }

    enum EscrowStatus { Null, Locked, Released, Refunded }

    struct EscrowState {
        EscrowStatus status;
        address sender;
        address receiver;
        address token;
        uint256 amount;
    }

    event FundsLocked(
        bytes32 indexed intentHash, 
        address indexed sender, 
        address indexed receiver, 
        address token, 
        uint256 amount
    );
    
    event FundsReleased(bytes32 indexed intentHash, bytes32 telcoReference);
    event FundsRefunded(bytes32 indexed intentHash);
}