module emcs::operator_registry {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::vec_map::{Self, VecMap};

    // Error codes
    const EUnauthorized: u64 = 1;
    const EOperatorAlreadyExists: u64 = 2;
    const EOperatorNotFound: u64 = 3;

    // Operator Registry structure
    public struct OperatorRegistry has key {
        id: UID,
        admin: address,
        operators: VecMap<address, bool>,
    }

    // Initialize the registry (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let registry = OperatorRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            operators: vec_map::empty(),
        };

        transfer::share_object(registry);
    }

    // Add an operator to the registry (admin only)
    public entry fun add_operator(
        registry: &mut OperatorRegistry,
        operator: address,
        ctx: &mut TxContext
    ) {
        // Only admin can add operators
        assert!(tx_context::sender(ctx) == registry.admin, EUnauthorized);

        // Add operator to the registry
        vec_map::insert(&mut registry.operators, operator, true);
    }

    // Remove an operator from the registry (admin only)
    public entry fun remove_operator(
        registry: &mut OperatorRegistry,
        operator: address,
        ctx: &mut TxContext
    ) {
        // Only admin can remove operators
        assert!(tx_context::sender(ctx) == registry.admin, EUnauthorized);

        // Remove operator from the registry
        let (_key, _value) = vec_map::remove(&mut registry.operators, &operator);
    }

    // Check if an operator is authorized
    public fun is_authorized(registry: &OperatorRegistry, operator: address): bool {
        vec_map::contains(&registry.operators, &operator)
    }

    // Get admin address
    public fun get_admin(registry: &OperatorRegistry): address {
        registry.admin
    }
}
