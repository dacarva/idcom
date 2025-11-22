// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IRiscZeroVerifier
/// @notice Interface for RISC Zero ZK proof verification router
/// @dev This is a router contract that routes to different verifiers based on seal selector
interface IRiscZeroVerifier {
    /// @notice Verify a RISC Zero ZK proof
    /// @param seal The ZK proof seal (first 4 bytes are selector)
    /// @param imageId The guest program image ID
    /// @param journalDigest The hash of the journal data
    /// @dev Reverts if verification fails, returns nothing on success
    function verify(bytes calldata seal, bytes32 imageId, bytes32 journalDigest) external view;
}

