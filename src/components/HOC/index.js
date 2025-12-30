/**
 * @fileoverview Barrel export for Higher-Order Components (HOCs).
 * @module components/HOC
 *
 * Re-exports all HOC utilities that provide data and actions from
 * Redux state to wrapped components following the composition pattern.
 *
 * Available HOCs:
 * - withAssociatedAlerts: Provides alert counts and actions for an entity
 * - withColumnData: Provides column metadata and interaction handlers
 * - withGlobalInterfaceData: Provides global UI state and actions
 * - withOperationData: Provides operation data and manipulation actions
 * - withPackOperationData: Provides pack operation (join) specific data
 * - withStackOperationData: Provides stack operation specific data
 * - withTableData: Provides table metadata and column management
 *
 * @example
 * import { withTableData, withColumnData } from './HOC';
 * const EnhancedTable = withTableData(TableComponent);
 */
export { default as withAssociatedAlerts } from "./withAssociatedAlerts.jsx";
export { default as withColumnData } from "./withColumnData.jsx";
export { default as withGlobalInterfaceData } from "./withGlobalInterfaceData.jsx";
export { default as withOperationData } from "./withOperationData.jsx";
export { default as withPackOperationData } from "./withPackOperationData.jsx";
export { default as withStackOperationData } from "./withStackOperationData.jsx";
export { default as withTableData } from "./withTableData.jsx";
