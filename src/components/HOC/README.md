# HOCs

High-Order Components (HOCs) are a layer that interfaces with global state and the views. From a category theory perspective, these HOCs form a computational context around components. In general, HOCs function as _thunks_, they don't compute anything until invoked with a component, enabling lazy evaluation / deferred computation:

- Dead code elimination: unused HOCs aren't instantiated
- Memoization opportunities: which can optimize the composition
- Dynamic composition: HOCs can be conditionally applied

More on composition
Each HOC is _functorial_, it maps components to enhanced components while preserving composition:

```
f: Component → EnhancedComponent
g: EnhancedComponent → DoubleEnhancedComponent
g ∘ f: Component → DoubleEnhancedComponent
```

This allows composition chains to be associative `(g ∘ f) ∘ h = g ∘ (f ∘ h)`.

This module include TK high-order components (HOCs)

- `withAssociatedAlerts.jsx`
- `withOperationData.jsx`
- `withPackOperationData.jsx`
- `withStackOperationData.jsx`
- `withTableData.jsx`

## Architectural Benefits

- Separation of Concerns: Each layer handles one responsibility
- Single Responsibility Principle: HOCs have focused purposes
- Open/Closed Principle: Extend behavior without modifying existing code
- Interface Segregation: Components receive only props they need
- Dependency Inversion: High-level components depend on abstractions (props), not concrete Redux store structure
- Can pass JavaScript objects like `Map` and `Set` that can't be serialized as props, therefore they can't be properties of objects stored in slices

This is fundamentally different from classical inheritance because there's no shared mutable state between layers, so it's close to Scala's tarit system or Haskell's type classes where behaviors are composed rather than inherited, but implemented using JavaScript's first-class functions rather than language-level features. This pattern is very well-suited to TypeScript which would provide type safety through the composition chain, inference and autocomplete, generic constraints, and utility types for cleaner function signatures. But I don't know TypeScript, so oh well.
