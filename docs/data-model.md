# Data Model notes

## Formal Definitions

**Definition 1 (Table)**: A table $T = (id, C, R)$ where $id$ is a unique identifier, $C = \{c_1, c_2, \ldots, c_n\}$ is a set of column identifiers, and $R$ is the set of rows.

**Definition 2 (Operation)**: An operation $O = (id, type, children, C_{out})$ where:

- $id$ is a unique identifier
- $type \in \{STACK, PACK, NO\_OP\}$
- $children = \{T_1, T_2, \ldots\} \cup \{O_1, O_2, \ldots\}$
- $C_{out}$ is the set of output column identifiers

**Definition 3 (STACK Operation)**: Given tables $T_1, T_2, \ldots, T_k$ with compatible schemas, $STACK(T_1, T_2, \ldots, T_k) = T'$ where $R_{T'} = R_{T_1} \cup R_{T_2} \cup \ldots \cup R_{T_k}$.

**Definition 4 (PACK Operation)**: Given tables $T_1, T_2$ with join keys $k_1 \in C_{T_1}$, $k_2 \in C_{T_2}$, and predicate $p$, $PACK(T_1, T_2, k_1, k_2, p, joinType) = T'$ where $R_{T'}$ follows standard SQL join semantics.
