// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";

/**
 * @title ProofOfHuman
 * @notice Demo implementation of SelfVerificationRoot for Proof of Human verification
 * @dev This contract provides a simple working implementation of the abstract SelfVerificationRoot
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Verification result storage
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bool public verificationSuccessful;
    bytes public lastUserData;
    address public lastUserAddress;

    // Verification config storage
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    // Refugee status storage
    mapping(bytes32 => bool) public refugees;
    address public owner;
    bytes32 private salt; // Salt for hashing passport numbers to preserve privacy

    // Custom errors
    error InvalidNationality(string nationality);
    error NotRefugee(string passportNumber);
    error Unauthorized();

    // Events for testing
    event VerificationCompleted(bytes userData);
    event RefugeeStatusSet(bytes32 indexed passportHash, bool refugeeStatus);
    event SaltUpdated();
    
    /**
     * @notice Event emitted to indicate refugee discount eligibility status
     * @param passportHash The hashed passport number (indexed for filtering)
     * @param nationality The nationality of the passport holder
     * @param isEligibleNationality Whether nationality is Colombian or Palestinian
     * @param isRefugee Whether the passport holder is registered as a refugee
     * @param isEligibleForDiscount Whether eligible for refugee discount (both nationality and refugee checks must pass)
     */
    event RefugeeDiscountEligibility(
        bytes32 indexed passportHash,
        string nationality,
        bool isEligibleNationality,
        bool isRefugee,
        bool isEligibleForDiscount
    );


    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed that is used to create the scope of the contract
     * @param _verificationConfig The verification configuration that will be used to process the proof in the VerificationHub
     * @param _owner The authorized address that can set refugee status
     * @param _salt The salt used for hashing passport numbers (should be kept secret)
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed, 
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig,
        address _owner,
        bytes32 _salt
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
        owner = _owner;
        salt = _salt;
    }

    /**
     * @notice Implementation of customVerificationHook from SelfVerificationRoot
     * @dev This function is called by onVerificationSuccess after hub address validation
     *      Verifies that the user's nationality is either Colombian (COL) or Palestinian (PSE) AND is a refugee
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        // Verify nationality is either Colombian or Palestinian
        string memory nationality = output.nationality;
        bool isColombian = keccak256(bytes(nationality)) == keccak256(bytes(CountryCodes.COLOMBIA));
        bool isPalestinian = keccak256(bytes(nationality)) == keccak256(bytes("PSE"));
        bool isEligibleNationality = isColombian || isPalestinian;
        
        // Verify refugee status
        // Hash passport number with salt: keccak256(abi.encodePacked(passportNumber, salt))
        string memory passportNumber = output.idNumber;
        bytes32 passportHash = keccak256(abi.encodePacked(passportNumber, salt));
        bool hasRefugeeStatus = refugees[passportHash];
        
        // Determine overall eligibility for refugee discount
        bool isEligibleForDiscount = isEligibleNationality && hasRefugeeStatus;
        
        // Emit eligibility event (can be captured by client)
        emit RefugeeDiscountEligibility(
            passportHash,
            nationality,
            isEligibleNationality,
            hasRefugeeStatus,
            isEligibleForDiscount
        );
        
        // Only set verification as successful if eligible for discount
        if (isEligibleForDiscount) {
            verificationSuccessful = true;
            lastOutput = output;
            lastUserData = userData;
            lastUserAddress = address(uint160(output.userIdentifier));
            
            emit VerificationCompleted(userData);
        }
    }

    /**
     * @notice Set refugee status for a hashed passport number
     * @dev Only callable by the owner address
     * @dev Client should hash passport number with salt before calling: keccak256(abi.encodePacked(passportNumber, salt))
     * @param hashedPassportNumber The hashed passport number (passportNumber + salt hashed on client side)
     * @param refugeeStatus Whether the passport holder is a refugee
     */
    function setRefugeeStatus(bytes32 hashedPassportNumber, bool refugeeStatus) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        
        refugees[hashedPassportNumber] = refugeeStatus;
        
        emit RefugeeStatusSet(hashedPassportNumber, refugeeStatus);
    }

    /**
     * @notice Update the salt used for hashing passport numbers
     * @dev Only callable by the owner address
     * @dev WARNING: Changing salt will invalidate all existing refugee registrations
     * @param newSalt The new salt to use for hashing (not emitted in event for privacy)
     */
    function setSalt(bytes32 newSalt) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        
        salt = newSalt;
        emit SaltUpdated();
    }

    /**
     * @notice Check if a passport number belongs to a refugee
     * @param passportNumber The passport number to check
     * @return Whether the passport holder is registered as a refugee
     */
    function isRefugee(string memory passportNumber) public view returns (bool) {
        bytes32 passportHash = keccak256(abi.encodePacked(passportNumber, salt));
        return refugees[passportHash];
    }

    /**
     * @notice Hash a passport number with the contract's salt
     * @dev Helper function to compute the hash that should be used in setRefugeeStatus
     * @param passportNumber The passport number to hash
     * @return The hashed passport number
     */
    function hashPassportNumber(string memory passportNumber) public view returns (bytes32) {
        return keccak256(abi.encodePacked(passportNumber, salt));
    }

    /**
     * @notice Implementation of getConfigId from SelfVerificationRoot
     * @dev Returns the verification config ID for this contract.
     *      - destinationChainId: The destination chain ID (placeholder for future crosschain use)
     *      - userIdentifier: The user identifier (passed in from the frontends userId field)
     *      - userDefinedData: The user defined data (passed in from the frontends userDefinedData field)
     * @return The verification configuration ID
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }
}
