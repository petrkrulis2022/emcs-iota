module emcs::consignment {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // Status constants
    const STATUS_DRAFT: u8 = 0;
    const STATUS_IN_TRANSIT: u8 = 1;
    const STATUS_RECEIVED: u8 = 2;

    // Error codes
    const EInvalidStatusTransition: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EConsignmentNotFound: u64 = 3;
    const EInvalidARC: u64 = 4;

    // Consignment NFT structure
    public struct Consignment has key, store {
        id: UID,
        arc: String,
        consignor: address,
        consignee: address,
        goods_type: String,
        quantity: u64,
        unit: String,
        origin: String,
        destination: String,
        status: u8,
        document_hash: Option<vector<u8>>,
        created_at: u64,
        dispatched_at: Option<u64>,
        received_at: Option<u64>,
    }

    // Movement event structure
    public struct MovementEvent has copy, drop {
        arc: String,
        event_type: u8,
        actor: address,
        timestamp: u64,
        transaction_id: address,
    }

    // Event type constants
    const EVENT_CREATED: u8 = 0;
    const EVENT_DISPATCHED: u8 = 1;
    const EVENT_RECEIVED: u8 = 2;

    // Create a new consignment
    public entry fun create_consignment(
        arc: vector<u8>,
        consignee: address,
        goods_type: vector<u8>,
        quantity: u64,
        unit: vector<u8>,
        origin: vector<u8>,
        destination: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        let arc_string = string::utf8(arc);
        let sender = tx_context::sender(ctx);
        
        let consignment = Consignment {
            id: object::new(ctx),
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
        };

        // Emit ConsignmentCreated event
        event::emit(MovementEvent {
            arc: arc_string,
            event_type: EVENT_CREATED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });

        transfer::share_object(consignment);
    }

    // Getter functions
    public fun get_arc(consignment: &Consignment): String {
        consignment.arc
    }

    public fun get_consignor(consignment: &Consignment): address {
        consignment.consignor
    }

    public fun get_consignee(consignment: &Consignment): address {
        consignment.consignee
    }

    public fun get_goods_type(consignment: &Consignment): String {
        consignment.goods_type
    }

    public fun get_quantity(consignment: &Consignment): u64 {
        consignment.quantity
    }

    public fun get_unit(consignment: &Consignment): String {
        consignment.unit
    }

    public fun get_origin(consignment: &Consignment): String {
        consignment.origin
    }

    public fun get_destination(consignment: &Consignment): String {
        consignment.destination
    }

    public fun get_status(consignment: &Consignment): u8 {
        consignment.status
    }

    public fun get_document_hash(consignment: &Consignment): Option<vector<u8>> {
        consignment.document_hash
    }

    public fun get_created_at(consignment: &Consignment): u64 {
        consignment.created_at
    }

    public fun get_dispatched_at(consignment: &Consignment): Option<u64> {
        consignment.dispatched_at
    }

    public fun get_received_at(consignment: &Consignment): Option<u64> {
        consignment.received_at
    }

    // Dispatch consignment (Draft -> In Transit)
    public entry fun dispatch_consignment(
        consignment: &mut Consignment,
        document_hash: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Authorization check: only consignor can dispatch
        assert!(sender == consignment.consignor, EUnauthorized);
        
        // Validate status transition: must be Draft
        assert!(consignment.status == STATUS_DRAFT, EInvalidStatusTransition);

        // Update status and store document hash
        consignment.status = STATUS_IN_TRANSIT;
        consignment.document_hash = option::some(document_hash);
        consignment.dispatched_at = option::some(timestamp);

        // Emit ConsignmentDispatched event
        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_DISPATCHED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });
    }

    // Receive consignment (In Transit -> Received)
    public entry fun receive_consignment(
        consignment: &mut Consignment,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Authorization check: only consignee can receive
        assert!(sender == consignment.consignee, EUnauthorized);
        
        // Validate status transition: must be In Transit
        assert!(consignment.status == STATUS_IN_TRANSIT, EInvalidStatusTransition);

        // Update status and record timestamp
        consignment.status = STATUS_RECEIVED;
        consignment.received_at = option::some(timestamp);

        // Emit ConsignmentReceived event
        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_RECEIVED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });
    }
}
