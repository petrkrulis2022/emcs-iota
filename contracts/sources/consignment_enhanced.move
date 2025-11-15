/// Enhanced EMCS Consignment Module with IOTA Notarization Patterns
/// Implements NFT-based consignment tracking with immutable audit trail
module emcs::consignment_enhanced {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::clock::{Self, Clock};
    use sui::hash;

    // =================== ERROR CODES ===================
    const EInvalidStatusTransition: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EConsignmentNotFound: u64 = 3;
    const EInvalidARC: u64 = 4;
    const EDocumentAlreadyNotarized: u64 = 5;
    const EInvalidDocumentHash: u64 = 6;

    // =================== STATUS CONSTANTS ===================
    const STATUS_DRAFT: u8 = 0;
    const STATUS_IN_TRANSIT: u8 = 1;
    const STATUS_RECEIVED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    // =================== EVENT TYPE CONSTANTS ===================
    const EVENT_CREATED: u8 = 0;
    const EVENT_DISPATCHED: u8 = 1;
    const EVENT_RECEIVED: u8 = 2;
    const EVENT_CANCELLED: u8 = 3;
    const EVENT_DOCUMENT_NOTARIZED: u8 = 4;

    // =================== STRUCTS ===================

    /// Main Consignment NFT - represents an excise goods shipment
    /// Uses IOTA's object model with key + store abilities
    public struct Consignment has key, store {
        id: UID,
        /// Administrative Reference Code (ARC) - EU standard identifier
        arc: String,
        /// Consignor (sender) address
        consignor: address,
        /// Consignee (receiver) address
        consignee: address,
        /// Type of goods (Wine, Beer, Spirits, Tobacco, Energy)
        goods_type: String,
        /// Quantity of goods
        quantity: u64,
        /// Unit of measurement (Liters, Kilograms, etc.)
        unit: String,
        /// Origin location
        origin: String,
        /// Destination location
        destination: String,
        /// Current status (0=Draft, 1=InTransit, 2=Received, 3=Cancelled)
        status: u8,
        /// SHA256 hash of the e-AD document (notarized on-chain)
        document_hash: Option<vector<u8>>,
        /// Timestamp when consignment was created (milliseconds)
        created_at: u64,
        /// Timestamp when consignment was dispatched
        dispatched_at: Option<u64>,
        /// Timestamp when consignment was received
        received_at: Option<u64>,
        /// Additional metadata (extensible)
        metadata: Option<String>,
    }

    /// Display metadata for the Consignment NFT
    /// Allows wallets and explorers to show human-readable information
    public struct ConsignmentDisplay has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
    }

    /// Notarization Record - immutable proof of document existence
    /// Implements IOTA Notarization pattern for legal compliance
    public struct NotarizationRecord has key, store {
        id: UID,
        /// Reference to the consignment
        consignment_id: ID,
        /// SHA256 hash of the document
        document_hash: vector<u8>,
        /// Notarization timestamp
        notarized_at: u64,
        /// Notarizer address (prover)
        notarizer: address,
        /// Document type (e-AD, Receipt, etc.)
        document_type: String,
    }

    // =================== EVENTS ===================

    /// Emitted when a consignment is created
    public struct ConsignmentCreated has copy, drop {
        consignment_id: ID,
        arc: String,
        consignor: address,
        consignee: address,
        goods_type: String,
        quantity: u64,
        timestamp: u64,
    }

    /// Emitted when a consignment is dispatched
    public struct ConsignmentDispatched has copy, drop {
        consignment_id: ID,
        arc: String,
        consignor: address,
        document_hash: vector<u8>,
        timestamp: u64,
    }

    /// Emitted when a consignment is received
    public struct ConsignmentReceived has copy, drop {
        consignment_id: ID,
        arc: String,
        consignee: address,
        timestamp: u64,
    }

    /// Emitted when a consignment is cancelled
    public struct ConsignmentCancelled has copy, drop {
        consignment_id: ID,
        arc: String,
        cancelled_by: address,
        reason: String,
        timestamp: u64,
    }

    /// Emitted when a document is notarized
    public struct DocumentNotarized has copy, drop {
        consignment_id: ID,
        notarization_id: ID,
        document_hash: vector<u8>,
        document_type: String,
        notarizer: address,
        timestamp: u64,
    }

    /// Generic movement event for backward compatibility
    public struct MovementEvent has copy, drop {
        arc: String,
        event_type: u8,
        actor: address,
        timestamp: u64,
        transaction_digest: address,
    }

    // =================== PUBLIC ENTRY FUNCTIONS ===================

    /// Create a new consignment (Draft status)
    /// Only the consignor can create a consignment
    public entry fun create_consignment(
        arc: vector<u8>,
        consignee: address,
        goods_type: vector<u8>,
        quantity: u64,
        unit: vector<u8>,
        origin: vector<u8>,
        destination: vector<u8>,
        metadata: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let arc_string = string::utf8(arc);
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        let consignment_uid = object::new(ctx);
        let consignment_id = object::uid_to_inner(&consignment_uid);
        
        let consignment = Consignment {
            id: consignment_uid,
            arc: arc_string,
            consignor: sender,
            consignee,
            goods_type: string::utf8(goods_type),
            quantity,
            unit: string::utf8(unit),
            origin: string::utf8(origin),
            destination: string::utf8(destination),
            status: STATUS_DRAFT,
            document_hash: option::none(),
            created_at: timestamp,
            dispatched_at: option::none(),
            received_at: option::none(),
            metadata: if (std::vector::length(&metadata) > 0) {
                option::some(string::utf8(metadata))
            } else {
                option::none()
            },
        };

        // Emit ConsignmentCreated event
        event::emit(ConsignmentCreated {
            consignment_id,
            arc: arc_string,
            consignor: sender,
            consignee,
            goods_type: string::utf8(goods_type),
            quantity,
            timestamp,
        });

        // Emit generic movement event for backward compatibility
        event::emit(MovementEvent {
            arc: arc_string,
            event_type: EVENT_CREATED,
            actor: sender,
            timestamp,
            transaction_digest: sender,
        });

        // Share the consignment object so both consignor and consignee can access it
        transfer::share_object(consignment);
    }

    /// Dispatch consignment (Draft -> In Transit)
    /// Creates an immutable notarization record of the e-AD document
    public entry fun dispatch_consignment(
        consignment: &mut Consignment,
        document_hash: vector<u8>,
        document_type: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        // Authorization: only consignor can dispatch
        assert!(sender == consignment.consignor, EUnauthorized);
        
        // Validate status transition: must be Draft
        assert!(consignment.status == STATUS_DRAFT, EInvalidStatusTransition);

        // Validate document hash
        assert!(std::vector::length(&document_hash) == 32, EInvalidDocumentHash);

        // Update consignment status
        consignment.status = STATUS_IN_TRANSIT;
        consignment.document_hash = option::some(document_hash);
        consignment.dispatched_at = option::some(timestamp);

        // Create immutable notarization record (IOTA Notarization pattern)
        let consignment_id = object::uid_to_inner(&consignment.id);
        let notarization_uid = object::new(ctx);
        let notarization_id = object::uid_to_inner(&notarization_uid);
        
        let notarization = NotarizationRecord {
            id: notarization_uid,
            consignment_id,
            document_hash,
            notarized_at: timestamp,
            notarizer: sender,
            document_type: string::utf8(document_type),
        };

        // Emit events
        event::emit(ConsignmentDispatched {
            consignment_id,
            arc: consignment.arc,
            consignor: sender,
            document_hash,
            timestamp,
        });

        event::emit(DocumentNotarized {
            consignment_id,
            notarization_id,
            document_hash,
            document_type: string::utf8(document_type),
            notarizer: sender,
            timestamp,
        });

        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_DISPATCHED,
            actor: sender,
            timestamp,
            transaction_digest: sender,
        });

        // Transfer notarization record to consignment owner (immutable proof)
        transfer::public_freeze_object(notarization);
    }

    /// Receive consignment (In Transit -> Received)
    /// Only the consignee can confirm receipt
    public entry fun receive_consignment(
        consignment: &mut Consignment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        // Authorization: only consignee can receive
        assert!(sender == consignment.consignee, EUnauthorized);
        
        // Validate status transition: must be In Transit
        assert!(consignment.status == STATUS_IN_TRANSIT, EInvalidStatusTransition);

        // Update consignment status
        consignment.status = STATUS_RECEIVED;
        consignment.received_at = option::some(timestamp);

        let consignment_id = object::uid_to_inner(&consignment.id);

        // Emit events
        event::emit(ConsignmentReceived {
            consignment_id,
            arc: consignment.arc,
            consignee: sender,
            timestamp,
        });

        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_RECEIVED,
            actor: sender,
            timestamp,
            transaction_digest: sender,
        });
    }

    /// Cancel consignment (Draft -> Cancelled)
    /// Only the consignor can cancel before dispatch
    public entry fun cancel_consignment(
        consignment: &mut Consignment,
        reason: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        // Authorization: only consignor can cancel
        assert!(sender == consignment.consignor, EUnauthorized);
        
        // Can only cancel if Draft
        assert!(consignment.status == STATUS_DRAFT, EInvalidStatusTransition);

        // Update status
        consignment.status = STATUS_CANCELLED;

        let consignment_id = object::uid_to_inner(&consignment.id);
        let reason_string = string::utf8(reason);

        // Emit events
        event::emit(ConsignmentCancelled {
            consignment_id,
            arc: consignment.arc,
            cancelled_by: sender,
            reason: reason_string,
            timestamp,
        });

        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_CANCELLED,
            actor: sender,
            timestamp,
            transaction_digest: sender,
        });
    }

    // =================== VIEW FUNCTIONS ===================

    /// Get consignment ARC
    public fun get_arc(consignment: &Consignment): String {
        consignment.arc
    }

    /// Get consignor address
    public fun get_consignor(consignment: &Consignment): address {
        consignment.consignor
    }

    /// Get consignee address
    public fun get_consignee(consignment: &Consignment): address {
        consignment.consignee
    }

    /// Get goods type
    public fun get_goods_type(consignment: &Consignment): String {
        consignment.goods_type
    }

    /// Get quantity
    public fun get_quantity(consignment: &Consignment): u64 {
        consignment.quantity
    }

    /// Get unit
    public fun get_unit(consignment: &Consignment): String {
        consignment.unit
    }

    /// Get origin
    public fun get_origin(consignment: &Consignment): String {
        consignment.origin
    }

    /// Get destination
    public fun get_destination(consignment: &Consignment): String {
        consignment.destination
    }

    /// Get current status
    public fun get_status(consignment: &Consignment): u8 {
        consignment.status
    }

    /// Get document hash
    public fun get_document_hash(consignment: &Consignment): Option<vector<u8>> {
        consignment.document_hash
    }

    /// Get created timestamp
    public fun get_created_at(consignment: &Consignment): u64 {
        consignment.created_at
    }

    /// Get dispatched timestamp
    public fun get_dispatched_at(consignment: &Consignment): Option<u64> {
        consignment.dispatched_at
    }

    /// Get received timestamp
    public fun get_received_at(consignment: &Consignment): Option<u64> {
        consignment.received_at
    }

    /// Get metadata
    public fun get_metadata(consignment: &Consignment): Option<String> {
        consignment.metadata
    }

    /// Check if consignment is in a specific status
    public fun is_draft(consignment: &Consignment): bool {
        consignment.status == STATUS_DRAFT
    }

    public fun is_in_transit(consignment: &Consignment): bool {
        consignment.status == STATUS_IN_TRANSIT
    }

    public fun is_received(consignment: &Consignment): bool {
        consignment.status == STATUS_RECEIVED
    }

    public fun is_cancelled(consignment: &Consignment): bool {
        consignment.status == STATUS_CANCELLED
    }

    // =================== NOTARIZATION VIEW FUNCTIONS ===================

    /// Get notarization document hash
    public fun get_notarization_hash(record: &NotarizationRecord): vector<u8> {
        record.document_hash
    }

    /// Get notarization timestamp
    public fun get_notarization_timestamp(record: &NotarizationRecord): u64 {
        record.notarized_at
    }

    /// Get notarizer address
    public fun get_notarizer(record: &NotarizationRecord): address {
        record.notarizer
    }

    /// Get document type
    public fun get_document_type(record: &NotarizationRecord): String {
        record.document_type
    }

    // =================== HELPER FUNCTIONS ===================

    /// Verify document hash matches the stored hash
    public fun verify_document_hash(
        consignment: &Consignment,
        provided_hash: vector<u8>
    ): bool {
        if (option::is_none(&consignment.document_hash)) {
            return false
        };
        
        let stored_hash = option::borrow(&consignment.document_hash);
        stored_hash == &provided_hash
    }
}
