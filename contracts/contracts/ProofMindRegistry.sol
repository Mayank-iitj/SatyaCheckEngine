// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SatyaCheckRegistry
 * @notice On-chain registry for academic credential hashes.
 *         Universities register as issuers, issue credential hashes,
 *         and can revoke them. Anyone can verify a credential hash.
 */
contract SatyaCheckRegistry is Ownable {
    struct Credential {
        address issuer;
        bytes32 credentialHash;
        string metadataURI; // IPFS pointer
        uint256 timestamp;
        bool revoked;
        string revokedReason;
    }

    /// @notice Mapping from credential hash to its on-chain record
    mapping(bytes32 => Credential) public credentials;

    /// @notice Mapping of registered institution addresses
    mapping(address => bool) public registeredInstitutions;

    /// @notice Mapping of institution address to name
    mapping(address => string) public institutionNames;

    /// @notice Total number of credentials issued
    uint256 public totalCredentials;

    /// @notice Total number of registered institutions
    uint256 public totalInstitutions;

    // ── Events ──────────────────────────────────────────────────────────
    event InstitutionRegistered(
        address indexed institution,
        string name,
        uint256 timestamp
    );

    event InstitutionRemoved(
        address indexed institution,
        uint256 timestamp
    );

    event CredentialIssued(
        bytes32 indexed hash,
        address indexed issuer,
        string metadataURI,
        uint256 timestamp
    );

    event CredentialRevoked(
        bytes32 indexed hash,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );

    // ── Modifiers ───────────────────────────────────────────────────────
    modifier onlyInstitution() {
        require(
            registeredInstitutions[msg.sender],
            "SatyaCheck: caller is not a registered institution"
        );
        _;
    }

    // ── Constructor ─────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Admin Functions ─────────────────────────────────────────────────

    /**
     * @notice Register a new institution (admin only)
     * @param institution The wallet address of the institution
     * @param name Human-readable institution name
     */
    function registerInstitution(
        address institution,
        string calldata name
    ) external onlyOwner {
        require(
            !registeredInstitutions[institution],
            "SatyaCheck: institution already registered"
        );
        require(institution != address(0), "SatyaCheck: zero address");

        registeredInstitutions[institution] = true;
        institutionNames[institution] = name;
        totalInstitutions++;

        emit InstitutionRegistered(institution, name, block.timestamp);
    }

    /**
     * @notice Remove a registered institution (admin only)
     * @param institution The wallet address to remove
     */
    function removeInstitution(address institution) external onlyOwner {
        require(
            registeredInstitutions[institution],
            "SatyaCheck: institution not registered"
        );

        registeredInstitutions[institution] = false;
        totalInstitutions--;

        emit InstitutionRemoved(institution, block.timestamp);
    }

    // ── Institution Functions ───────────────────────────────────────────

    /**
     * @notice Issue a new credential hash on-chain
     * @param hash SHA-256 hash of the credential data
     * @param metadataURI IPFS URI pointing to credential metadata
     */
    function issueCredential(
        bytes32 hash,
        string calldata metadataURI
    ) external onlyInstitution {
        require(
            credentials[hash].timestamp == 0,
            "SatyaCheck: credential already exists"
        );
        require(hash != bytes32(0), "SatyaCheck: empty hash");

        credentials[hash] = Credential({
            issuer: msg.sender,
            credentialHash: hash,
            metadataURI: metadataURI,
            timestamp: block.timestamp,
            revoked: false,
            revokedReason: ""
        });

        totalCredentials++;

        emit CredentialIssued(hash, msg.sender, metadataURI, block.timestamp);
    }

    /**
     * @notice Batch issue multiple credentials in one transaction (gas-efficient)
     * @param hashes Array of credential hashes
     * @param metadataURIs Array of IPFS URIs
     */
    function batchIssueCredentials(
        bytes32[] calldata hashes,
        string[] calldata metadataURIs
    ) external onlyInstitution {
        require(
            hashes.length == metadataURIs.length,
            "SatyaCheck: arrays length mismatch"
        );
        require(hashes.length > 0, "SatyaCheck: empty arrays");
        require(hashes.length <= 100, "SatyaCheck: batch too large");

        for (uint256 i = 0; i < hashes.length; i++) {
            bytes32 hash = hashes[i];
            require(hash != bytes32(0), "SatyaCheck: empty hash in batch");
            require(
                credentials[hash].timestamp == 0,
                "SatyaCheck: duplicate in batch"
            );

            credentials[hash] = Credential({
                issuer: msg.sender,
                credentialHash: hash,
                metadataURI: metadataURIs[i],
                timestamp: block.timestamp,
                revoked: false,
                revokedReason: ""
            });

            emit CredentialIssued(
                hash,
                msg.sender,
                metadataURIs[i],
                block.timestamp
            );
        }

        totalCredentials += hashes.length;
    }

    /**
     * @notice Revoke a previously issued credential
     * @param hash The credential hash to revoke
     * @param reason Human-readable revocation reason
     */
    function revokeCredential(
        bytes32 hash,
        string calldata reason
    ) external {
        Credential storage c = credentials[hash];
        require(c.timestamp != 0, "SatyaCheck: credential not found");
        require(
            c.issuer == msg.sender,
            "SatyaCheck: only the issuer can revoke"
        );
        require(!c.revoked, "SatyaCheck: already revoked");

        c.revoked = true;
        c.revokedReason = reason;

        emit CredentialRevoked(hash, msg.sender, reason, block.timestamp);
    }

    // ── Public View Functions ───────────────────────────────────────────

    /**
     * @notice Verify a credential by its hash
     * @param hash The credential hash to verify
     * @return exists Whether the credential exists on-chain
     * @return revoked Whether the credential has been revoked
     * @return issuer Address of the issuing institution
     * @return timestamp Block timestamp when the credential was issued
     * @return metadataURI IPFS pointer to credential metadata
     */
    function verifyCredential(
        bytes32 hash
    )
        external
        view
        returns (
            bool exists,
            bool revoked,
            address issuer,
            uint256 timestamp,
            string memory metadataURI
        )
    {
        Credential memory c = credentials[hash];
        exists = c.timestamp != 0;
        return (exists, c.revoked, c.issuer, c.timestamp, c.metadataURI);
    }

    /**
     * @notice Check if an address is a registered institution
     * @param institution The address to check
     * @return isRegistered Whether the address is registered
     * @return name The institution name (empty if not registered)
     */
    function getInstitution(
        address institution
    )
        external
        view
        returns (bool isRegistered, string memory name)
    {
        return (
            registeredInstitutions[institution],
            institutionNames[institution]
        );
    }
}
