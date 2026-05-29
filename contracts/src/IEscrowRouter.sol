// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IEscrowRouter.sol";

contract EscrowRouter is IEscrowRouter, EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    address public immutable relayer;
    mapping(bytes32 => EscrowState) public escrows;

    bytes32 private constant _INTENT_TYPEHASH = keccak256(
        "EscrowIntent(address sender,address receiver,address token,uint256 amount,uint256 nonce,uint256 deadline,bytes32 telcoReference)"
    );

    bytes32 private constant _RELEASE_TYPEHASH = keccak256(
        "ReleaseMessage(bytes32 intentHash,bytes32 telcoReference)"
    );

    modifier onlyRelayer(bytes32 intentHash, bytes32 telcoReference, bytes calldata signature) {
        bytes32 structHash = keccak256(abi.encode(_RELEASE_TYPEHASH, intentHash, telcoReference));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        require(signer == relayer, "EscrowRouter: invalid relayer signature");
        _;
    }

    constructor(address _relayer) EIP712("OpenwayEscrow", "1") {
        require(_relayer != address(0), "EscrowRouter: zero relayer address");
        relayer = _relayer;
    }

    function lockFunds(EscrowIntent calldata intent) external nonReentrant {
        require(block.timestamp <= intent.deadline, "EscrowRouter: intent expired");
        require(intent.sender == msg.sender, "EscrowRouter: unauthorized sender");
        
        bytes32 intentHash = _hashIntent(intent);
        require(escrows[intentHash].status == EscrowStatus.Null, "EscrowRouter: intent already exists");

        IERC20(intent.token).safeTransferFrom(intent.sender, address(this), intent.amount);

        escrows[intentHash] = EscrowState({
            status: EscrowStatus.Locked,
            sender: intent.sender,
            receiver: intent.receiver,
            token: intent.token,
            amount: intent.amount
        });

        emit FundsLocked(intentHash, intent.sender, intent.receiver, intent.token, intent.amount);
    }

    function releaseFunds(
        bytes32 intentHash, 
        bytes32 telcoReference, 
        bytes calldata signature
    ) external nonReentrant onlyRelayer(intentHash, telcoReference, signature) {
        EscrowState storage state = escrows[intentHash];
        require(state.status == EscrowStatus.Locked, "EscrowRouter: invalid escrow state");

        state.status = EscrowStatus.Released;
        IERC20(state.token).safeTransfer(state.receiver, state.amount);

        emit FundsReleased(intentHash, telcoReference);
    }

    function refundFunds(bytes32 intentHash) external nonReentrant {
        EscrowState storage state = escrows[intentHash];
        require(state.status == EscrowStatus.Locked, "EscrowRouter: invalid escrow state");
        require(msg.sender == state.sender, "EscrowRouter: unauthorized refund");
        
        // In a production system, a timeout threshold would be enforced here.
        state.status = EscrowStatus.Refunded;
        IERC20(state.token).safeTransfer(state.sender, state.amount);

        emit FundsRefunded(intentHash);
    }

    function _hashIntent(EscrowIntent calldata intent) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            _INTENT_TYPEHASH,
            intent.sender,
            intent.receiver,
            intent.token,
            intent.amount,
            intent.nonce,
            intent.deadline,
            intent.telcoReference
        ));
    }
}