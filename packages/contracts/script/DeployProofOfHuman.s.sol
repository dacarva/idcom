// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ProofOfHuman } from "../src/ProofOfHuman.sol";
import { BaseScript } from "./Base.s.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployProofOfHuman
/// @notice Deployment script for ProofOfHuman contract using standard deployment
contract DeployProofOfHuman is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return proofOfHuman The deployed ProofOfHuman contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "self-workshop")
    ///      - SALT: Optional bytes32 salt for hashing passport numbers (if not provided, generates one)
    ///      - VERIFICATION_CONFIG: Verification configuration that will be used to process the proof in the VerificationHub

    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        
        // Get salt from environment or generate one
        bytes32 salt;
        try vm.envBytes32("SALT") returns (bytes32 envSalt) {
            salt = envSalt;
        } catch {
            // Generate a salt from block data if not provided
            salt = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, broadcaster));
        }
        
        // Empty forbiddenCountries array - nationality checking is done in customVerificationHook
        string[] memory forbiddenCountries = new string[](0);
        
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: false
        });

        // Deploy the contract using SCOPE_SEED from environment
        // Owner is set to the broadcaster address (deployer)
        proofOfHuman = new ProofOfHuman(hubAddress, scopeSeed, verificationConfig, broadcaster, salt);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(proofOfHuman));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", proofOfHuman.scope());

        // Verify deployment was successful
        if (address(proofOfHuman) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
        console.log("Owner address:", proofOfHuman.owner());
        console.log("Salt (keep secret!):");
        console.logBytes32(salt);
    }
}
