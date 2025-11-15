/// EMCS Consignment Tracking on IOTA
/// Implements EU's Electronic Movement and Control System for excise goods
/// Using IOTA's object model, events, and notarization patterns
module emcs::consignment {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // =================== STATUS CONSTANTS ===================
    const STATUS_DRAFT: u8 = 0;
    const STATUS_IN_TRANSIT: u8 = 1;
    const STATUS_RECEIVED: u8 = 2;

    // =================== ERROR CODES ===================
    const EInvalidStatusTransition: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EConsignmentNotFound: u64 = 3;
    const EInvalidARC: u64 = 4;
    const EInvalidDocumentHash: u64 = 5;

    // =================== STRUCTS ===================
    
    /// Main Consignment NFT - EU excise goods shipment tracking
    /// Implements IOTA's NFT pattern with key + store abilities
    public struct Consignment has key, store {
        id: UID,
        /// Administrative Reference Code (EU standard unique identifier)
        arc: String,
        /// Consignor (sender) wallet address
        consignor: address,
        /// Consignee (receiver) wallet address
        consignee: address,
        /// Goods type (Wine, Beer, Spirits, Tobacco, Energy)
        goods_type: String,
        /// Quantity of goods in liters or other units
        quantity: u64,
        /// Unit of measurement
        unit: String,
        /// Origin location
        origin: String,
        /// Destination location
        destination: String,
        /// Transport modes (Road, Rail, Sea) - can be multiple
        transport_modes: vector<String>,
        /// Beer name (e.g., "Pilsner Urquell") - optional, only for beer
        beer_name: Option<String>,
        /// Alcohol by volume percentage (ABV) - optional, only for alcoholic beverages
        /// Stored as integer (e.g., 44 for 4.4%, 45 for 4.5%)
        alcohol_percentage: Option<u64>,
        /// Excise duty amount in euro cents - calculated based on ABV and volume
        excise_duty_cents: Option<u64>,
        /// Current status (0=Draft, 1=InTransit, 2=Received)
        status: u8,
        /// SHA256 hash of e-AD document (notarized on-chain)
        document_hash: Option<vector<u8>>,
        /// Creation timestamp (milliseconds since epoch)
        created_at: u64,
        /// Dispatch timestamp
        dispatched_at: Option<u64>,
        /// Receipt timestamp
        received_at: Option<u64>,
    }

    // =================== EVENTS ===================
    // Events follow IOTA pattern: has copy, drop abilities
    
    /// Emitted when consignment is created
    public struct ConsignmentCreated has copy, drop {
        consignment_id: ID,
        arc: String,
        consignor: address,
        consignee: address,
        goods_type: String,
        quantity: u64,
        timestamp: u64,
    }

    /// Emitted when consignment is dispatched
    public struct ConsignmentDispatched has copy, drop {
        consignment_id: ID,
        arc: String,
        consignor: address,
        consignee: address,
        document_hash: vector<u8>,
        timestamp: u64,
    }

    /// Emitted when consignment is received
    public struct ConsignmentReceived has copy, drop {
        consignment_id: ID,
        arc: String,
        consignor: address,
        consignee: address,
        timestamp: u64,
    }

    /// Generic movement event (backward compatibility)
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

    // =================== PUBLIC ENTRY FUNCTIONS ===================
    // =================== PUBLIC ENTRY FUNCTIONS ===================
    
    /// Create a new consignment (Draft status)
    /// Uses IOTA Clock for accurate timestamping
    /// transport_modes_bytes: comma-separated list of transport modes (e.g., "Road,Rail,Sea")
    /// beer_name_bytes: optional beer name (empty vector if not beer)
    /// alcohol_percentage: optional ABV * 10 (e.g., 44 for 4.4%, 0 if not applicable)
    public entry fun create_consignment(
        arc: vector<u8>,
        consignee: address,
        goods_type: vector<u8>,
        quantity: u64,
        unit: vector<u8>,
        origin: vector<u8>,
        destination: vector<u8>,
        transport_modes_bytes: vector<u8>,
        beer_name_bytes: vector<u8>,
        alcohol_percentage: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let arc_string = string::utf8(arc);
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        let consignment_uid = object::new(ctx);
        let consignment_id = object::uid_to_inner(&consignment_uid);
        
        // Parse transport modes from comma-separated string
        let transport_modes = parse_transport_modes(transport_modes_bytes);
        
        // Parse optional beer name
        let beer_name = if (vector::length(&beer_name_bytes) > 0) {
            option::some(string::utf8(beer_name_bytes))
        } else {
            option::none()
        };
        
        // Set alcohol percentage if provided (non-zero)
        let alcohol_pct = if (alcohol_percentage > 0) {
            option::some(alcohol_percentage)
        } else {
            option::none()
        };
        
        // Calculate Irish excise duty for beer if applicable
        let excise_duty = if (alcohol_percentage > 0 && quantity > 0) {
            option::some(calculate_irish_beer_duty(quantity, alcohol_percentage))
        } else {
            option::none()
        };
        
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
            transport_modes,
            beer_name,
            alcohol_percentage: alcohol_pct,
            excise_duty_cents: excise_duty,
            status: STATUS_DRAFT,
            document_hash: option::none(),
            created_at: timestamp,
            dispatched_at: option::none(),
            received_at: option::none(),
        };

        // Emit structured event
        event::emit(ConsignmentCreated {
            consignment_id,
            arc: arc_string,
            consignor: sender,
            consignee,
            goods_type: string::utf8(goods_type),
            quantity,
            timestamp,
        });

        // Emit generic event for backward compatibility
        event::emit(MovementEvent {
            arc: arc_string,
            event_type: EVENT_CREATED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });

        // Share object so both consignor and consignee can access
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

    public fun get_transport_modes(consignment: &Consignment): vector<String> {
        consignment.transport_modes
    }

    public fun get_beer_name(consignment: &Consignment): Option<String> {
        consignment.beer_name
    }

    public fun get_alcohol_percentage(consignment: &Consignment): Option<u64> {
        consignment.alcohol_percentage
    }

    public fun get_excise_duty_cents(consignment: &Consignment): Option<u64> {
        consignment.excise_duty_cents
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

    /// Dispatch consignment (Draft -> In Transit)
    /// Only consignor can dispatch, and must attach document hash for notarization
    public entry fun dispatch_consignment(
        consignment: &mut Consignment,
        document_hash: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Authorization check: only consignor can dispatch
        assert!(sender == consignment.consignor, EUnauthorized);
        
        // Validate status transition: must be Draft
        assert!(consignment.status == STATUS_DRAFT, EInvalidStatusTransition);
        
        // Validate document hash
        assert!(vector::length(&document_hash) > 0, EInvalidDocumentHash);

        let timestamp = clock::timestamp_ms(clock);
        
        // Update status and store document hash
        consignment.status = STATUS_IN_TRANSIT;
        consignment.document_hash = option::some(document_hash);
        consignment.dispatched_at = option::some(timestamp);

        // Emit structured event
        event::emit(ConsignmentDispatched {
            consignment_id: object::id(consignment),
            arc: consignment.arc,
            consignor: sender,
            consignee: consignment.consignee,
            document_hash,
            timestamp,
        });

        // Emit generic event for backward compatibility
        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_DISPATCHED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });
    }

    /// Receive consignment (In Transit -> Received)
    /// Only consignee can receive
    public entry fun receive_consignment(
        consignment: &mut Consignment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Authorization check: only consignee can receive
        assert!(sender == consignment.consignee, EUnauthorized);
        
        // Validate status transition: must be In Transit
        assert!(consignment.status == STATUS_IN_TRANSIT, EInvalidStatusTransition);

        let timestamp = clock::timestamp_ms(clock);
        
        // Update status and record timestamp
        consignment.status = STATUS_RECEIVED;
        consignment.received_at = option::some(timestamp);

        // Emit structured event
        event::emit(ConsignmentReceived {
            consignment_id: object::id(consignment),
            arc: consignment.arc,
            consignor: consignment.consignor,
            consignee: sender,
            timestamp,
        });

        // Emit generic event for backward compatibility
        event::emit(MovementEvent {
            arc: consignment.arc,
            event_type: EVENT_RECEIVED,
            actor: sender,
            timestamp,
            transaction_id: sender,
        });
    }

    // =================== HELPER FUNCTIONS ===================
    
    /// Calculate Irish beer excise duty in euro cents
    /// Formula: Rate per hl × hectolitres × ABV%
    /// Rate for ABV > 2.8%: €22.55 per hl
    /// Rate for ABV ≤ 2.8%: €11.27 per hl
    /// 
    /// Parameters:
    /// - quantity_liters: volume in liters
    /// - alcohol_percentage_x10: ABV × 10 (e.g., 44 for 4.4%, 28 for 2.8%)
    /// 
    /// Returns: duty in euro cents
    fun calculate_irish_beer_duty(quantity_liters: u64, alcohol_percentage_x10: u64): u64 {
        // Convert liters to hectolitres (1 hl = 100 liters)
        let hectolitres = quantity_liters / 100;
        
        // Get ABV as actual percentage (divide by 10)
        let abv = alcohol_percentage_x10;
        
        // Determine rate based on ABV threshold (2.8% = 28 when x10)
        // Rates in euro cents per hectolitre
        let rate_cents = if (alcohol_percentage_x10 <= 28) {
            1127 // €11.27 = 1127 cents
        } else {
            2255 // €22.55 = 2255 cents
        };
        
        // Calculate duty: Rate × hectolitres × ABV
        // Since ABV is x10, we divide by 10 at the end
        let duty = (rate_cents * hectolitres * abv) / 10;
        
        duty
    }
    
    /// Parse comma-separated transport modes string into vector<String>
    /// Example: "Road,Rail,Sea" -> [String("Road"), String("Rail"), String("Sea")]
    fun parse_transport_modes(modes_bytes: vector<u8>): vector<String> {
        use std::vector;
        
        let mut modes = vector::empty<String>();
        
        if (vector::length(&modes_bytes) == 0) {
            return modes
        };
        
        let mut current_mode = vector::empty<u8>();
        let mut i = 0;
        let len = vector::length(&modes_bytes);
        
        while (i < len) {
            let byte = *vector::borrow(&modes_bytes, i);
            
            // Comma separator (ASCII 44)
            if (byte == 44) {
                if (vector::length(&current_mode) > 0) {
                    vector::push_back(&mut modes, string::utf8(current_mode));
                    current_mode = vector::empty<u8>();
                };
            } else {
                vector::push_back(&mut current_mode, byte);
            };
            
            i = i + 1;
        };
        
        // Add last mode
        if (vector::length(&current_mode) > 0) {
            vector::push_back(&mut modes, string::utf8(current_mode));
        };
        
        modes
    }
}
