// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MindVault
 * @dev Privacy-first therapist workspace access-control contract.
 *
 * A therapist requests access to a client record, the client approves consent,
 * and the therapist completes the session. Only identifiers, hashes, timestamps
 * and statuses are stored — never names, notes, diagnoses, phone numbers, files
 * or raw medical data.
 */
contract MindVault {
    // Lifecycle of a single access record.
    enum Status {
        None,
        Requested,
        Approved,
        Revoked,
        Completed
    }

    struct AccessRecord {
        address therapist;   // assigned therapist (msg.sender at request time)
        address client;      // the client who must approve consent
        bytes32 recordHash;  // reference / hash of the off-chain record
        uint64 expiry;       // access expiry timestamp (block.timestamp)
        Status status;       // current lifecycle status
        bool exists;         // existence flag so deleted ids can't be reused
    }

    mapping(uint256 => AccessRecord) public records;
    uint256 public recordCount;

    // Custom errors with clear names.
    error AccessNotFound(uint256 recordId);
    error NotClient();
    error NotTherapist();
    error NotAuthorized();
    error AccessNotRequested();
    error AccessNotApproved();
    error AccessExpired();
    error AccessAlreadyRevoked();
    error AccessAlreadyCompleted();
    error InvalidClient();
    error InvalidRecordHash();
    error InvalidDuration();

    // Events.
    event AccessRequested(
        uint256 indexed recordId,
        address indexed therapist,
        address indexed client,
        bytes32 recordHash,
        uint64 expiry
    );
    event ConsentApproved(uint256 indexed recordId, address indexed client);
    event AccessRevoked(uint256 indexed recordId, address indexed by);
    event SessionCompleted(uint256 indexed recordId, address indexed therapist);

    /**
     * @dev Therapist requests access to a client record.
     * Only the specified client can later approve consent.
     */
    function requestAccess(
        address client,
        bytes32 recordHash,
        uint64 durationSeconds
    ) public returns (uint256 recordId) {
        if (client == address(0)) {
            revert InvalidClient();
        }
        if (recordHash == bytes32(0)) {
            revert InvalidRecordHash();
        }
        if (durationSeconds == 0) {
            revert InvalidDuration();
        }

        recordId = ++recordCount;
        records[recordId] = AccessRecord({
            therapist: msg.sender,
            client: client,
            recordHash: recordHash,
            expiry: uint64(block.timestamp + durationSeconds),
            status: Status.Requested,
            exists: true
        });

        emit AccessRequested(recordId, msg.sender, client, recordHash, records[recordId].expiry);
        return recordId;
    }

    /**
     * @dev Client approves consent for a requested record.
     * Reverts unless msg.sender is the client, status is Requested, and not expired.
     */
    function approveConsent(uint256 recordId) public {
        AccessRecord storage r = records[recordId];

        if (!r.exists) {
            revert AccessNotFound(recordId);
        }
        if (msg.sender != r.client) {
            revert NotClient();
        }
        if (r.status != Status.Requested) {
            revert AccessNotRequested();
        }
        if (block.timestamp >= r.expiry) {
            revert AccessExpired();
        }

        r.status = Status.Approved;
        emit ConsentApproved(recordId, msg.sender);
    }

    /**
     * @dev Client or assigned therapist revokes access.
     * Reverts if already revoked or completed.
     */
    function revokeAccess(uint256 recordId) public {
        AccessRecord storage r = records[recordId];

        if (!r.exists) {
            revert AccessNotFound(recordId);
        }
        if (msg.sender != r.client && msg.sender != r.therapist) {
            revert NotAuthorized();
        }
        if (r.status == Status.Revoked) {
            revert AccessAlreadyRevoked();
        }
        if (r.status == Status.Completed) {
            revert AccessAlreadyCompleted();
        }

        r.status = Status.Revoked;
        emit AccessRevoked(recordId, msg.sender);
    }

    /**
     * @dev Assigned therapist completes the session.
     * Reverts unless consent is approved and not expired.
     */
    function completeSession(uint256 recordId) public {
        AccessRecord storage r = records[recordId];

        if (!r.exists) {
            revert AccessNotFound(recordId);
        }
        if (msg.sender != r.therapist) {
            revert NotTherapist();
        }
        if (r.status != Status.Approved) {
            revert AccessNotApproved();
        }
        if (block.timestamp >= r.expiry) {
            revert AccessExpired();
        }

        r.status = Status.Completed;
        emit SessionCompleted(recordId, msg.sender);
    }

    /**
     * @dev Returns true only when the record exists, is Approved, and has not expired.
     */
    function isAccessValid(uint256 recordId) public view returns (bool) {
        AccessRecord storage r = records[recordId];

        if (!r.exists) return false;
        if (r.status != Status.Approved) return false;
        if (block.timestamp >= r.expiry) return false;

        return true;
    }

    /**
     * @dev Returns every stored field of a record (no medical data, ever).
     */
    function getAccess(uint256 recordId)
        public
        view
        returns (
            address therapist,
            address client,
            bytes32 recordHash,
            uint64 expiry,
            Status status,
            bool exists
        )
    {
        AccessRecord storage r = records[recordId];

        therapist = r.therapist;
        client = r.client;
        recordHash = r.recordHash;
        expiry = r.expiry;
        status = r.status;
        exists = r.exists;
    }
}
