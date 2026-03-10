# Slices layer

### Module structure

Each application state domain is encapsulated in a state management module that defines the slice's initial state, reducers, selectors, and actions. Each slice module is organized around a specific domain of application data, such as columns, tables, and operations. Each module contains:

    - A slice definition that includes the initial state and reducers for handling actions related to that domain.
    - Selectors for accessing specific pieces of state related to that domain.
    - Generated action creators for dispatching actions that modify the state in that domain.
    - A factory function for creating and initializing serializable application data related to that domain. We follow this pattern instead of a class-based approach to avoid the need for serialization and deserialization when sharing data across application layers. The factory function can be used to create new instances of application data with the correct structure and default values, ensuring consistency across the application. Each data structure also stored precomputed metadata that is derived from database queries, such as summary statistics and top values for columns, which allows for faster access to this information when needed for analysis and visualization.
