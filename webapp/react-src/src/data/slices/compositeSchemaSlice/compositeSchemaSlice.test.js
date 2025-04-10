import { describe, test, expect, beforeEach, vi } from 'vitest';
import reducer, {
  createOperation,
  removeOperation,
  removeTable,
  isTableNode,
  isOperationNode,
  stratify
} from '.'; // Update path as needed

import { NO_OP } from "../../../lib/types/Operation"; // Update path as needed

describe('compositeSchema reducer', () => {
  // Initial state tests
  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      selectedTables: [],
      prevOperationId: null,
      data: {},
      loading: false,
      error: null,
    });
  });

  // Utility function tests
  describe('utility functions', () => {
    test('isTableNode should correctly identify table nodes', () => {
      const tableNode = { id: 'node-1', tableId: 'table-1' };
      const operationNode = { id: 'node-2', operationType: 'STACK' };
      
      expect(isTableNode(tableNode)).toBe(true);
      expect(isTableNode(operationNode)).toBe(false);
    });

    test('isOperationNode should correctly identify operation nodes', () => {
      const tableNode = { id: 'node-1', tableId: 'table-1' };
      const operationNode = { id: 'node-2', operationType: 'STACK' };
      
      expect(isOperationNode(operationNode)).toBe(true);
      expect(isOperationNode(tableNode)).toBe(false);
    });

    test('stratify should create a hierarchical structure', () => {
      const data = {
        'node-1': { id: 'node-1', operationType: 'STACK' },
        'node-2': { id: 'node-2', parentId: 'node-1', tableId: 'table-1' },
        'node-3': { id: 'node-3', parentId: 'node-1', tableId: 'table-2' }
      };
      
      const result = stratify(Object.values(data));
      expect(result.id).toBe('node-1');
      expect(result.children.length).toBe(2);
      expect(result.children[0].id).toBe('node-2');
      expect(result.children[1].id).toBe('node-3');
    });
  });

  // createOperation tests
  describe('createOperation reducer', () => {
    test('should handle initial operation creation', () => {
      const initialState = {
        selectedTables: [],
        prevOperationId: null,
        data: {},
        loading: false,
        error: null,
      };
      
      const action = createOperation({
        operationType: 'STACK',
        table: { id: 'table-1' }
      });
      
      const nextState = reducer(initialState, action);
      
      // Find the operation node
      const operationNodeKey = Object.keys(nextState.data).find(key => 
        isOperationNode(nextState.data[key])
      );
      const operationNode = nextState.data[operationNodeKey];
      
      // Find the table node
      const tableNodeKey = Object.keys(nextState.data).find(key => 
        isTableNode(nextState.data[key])
      );
      const tableNode = nextState.data[tableNodeKey];
      
      expect(operationNode.operationType).toBe('STACK');
      expect(tableNode.tableId).toBe('table-1');
      expect(tableNode.parentId).toBe(operationNode.id);
      expect(nextState.prevOperationId).toBe(operationNode.id);
      expect(nextState.selectedTables).toContain('table-1');
      expect(Object.keys(nextState.data).length).toBe(2); // One operation node, one table node
    });

    test('should handle adding a table to the same operation type', () => {
      // Create a state with one operation and one table
      const operationNode = { id: 'node-1', operationType: 'STACK' };
      const tableNode = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      
      const state = {
        selectedTables: ['table-1'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode
        },
        loading: false,
        error: null,
      };
      
      const action = createOperation({
        operationType: 'STACK',
        table: { id: 'table-2' }
      });
      
      const nextState = reducer(state, action);
      
      // Find the new table node
      const newTableNodeKey = Object.keys(nextState.data).find(key => 
        isTableNode(nextState.data[key]) && nextState.data[key].tableId === 'table-2'
      );
      const newTableNode = nextState.data[newTableNodeKey];
      
      expect(newTableNode.tableId).toBe('table-2');
      expect(newTableNode.parentId).toBe('node-1');
      expect(nextState.prevOperationId).toBe('node-1');
      expect(nextState.selectedTables).toContain('table-1');
      expect(nextState.selectedTables).toContain('table-2');
      expect(Object.keys(nextState.data).length).toBe(3); // One operation node, two table nodes
    });

    test('should handle switching to a different operation type', () => {
      // Create a state with one operation and one table
      const operationNode = { id: 'node-1', operationType: 'STACK' };
      const tableNode = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      
      const state = {
        selectedTables: ['table-1'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode
        },
        loading: false,
        error: null,
      };
      
      const action = createOperation({
        operationType: 'PACK',
        table: { id: 'table-2' }
      });
      
      const nextState = reducer(state, action);
      
      // Find the new operation node
      const newOperationNodeKey = Object.keys(nextState.data).find(key => 
        isOperationNode(nextState.data[key]) && nextState.data[key].id !== 'node-1'
      );
      const newOperationNode = nextState.data[newOperationNodeKey];
      
      // Find the new table node
      const newTableNodeKey = Object.keys(nextState.data).find(key => 
        isTableNode(nextState.data[key]) && nextState.data[key].tableId === 'table-2'
      );
      const newTableNode = nextState.data[newTableNodeKey];
      
      // Check that original operation now points to new operation
      expect(nextState.data['node-1'].parentId).toBe(newOperationNode.id);
      
      expect(newOperationNode.operationType).toBe('PACK');
      expect(newTableNode.tableId).toBe('table-2');
      expect(newTableNode.parentId).toBe(newOperationNode.id);
      expect(nextState.prevOperationId).toBe(newOperationNode.id);
      expect(nextState.selectedTables).toContain('table-1');
      expect(nextState.selectedTables).toContain('table-2');
    });

    test('should handle NO_OP with second table correctly', () => {
      // Create a state with one NO_OP operation and one table
      const operationNode = { id: 'node-1', operationType: NO_OP };
      const tableNode = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      
      const state = {
        selectedTables: ['table-1'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode
        },
        loading: false,
        error: null,
      };
      
      const action = createOperation({
        operationType: 'STACK',
        table: { id: 'table-2' }
      });
      
      const nextState = reducer(state, action);
      
      // Verify state was reset with new operation
      expect(Object.keys(nextState.data).length).toBe(3); // One operation node, two table nodes
      
      // Find the new operation node
      const newOperationNodeKey = Object.keys(nextState.data).find(key => 
        isOperationNode(nextState.data[key])
      );
      const newOperationNode = nextState.data[newOperationNodeKey];
      
      expect(newOperationNode.operationType).toBe('STACK');
      
      // Verify both tables are under the new operation
      const tableNodes = Object.values(nextState.data).filter(node => isTableNode(node));
      expect(tableNodes.length).toBe(2);
      expect(tableNodes[0].parentId).toBe(newOperationNode.id);
      expect(tableNodes[1].parentId).toBe(newOperationNode.id);
      
      // Verify selected tables
      expect(nextState.selectedTables.length).toBe(2);
      expect(nextState.selectedTables).toContain('table-2');
    });

    test('should handle errors during operation creation', () => {
      const initialState = {
        selectedTables: [],
        prevOperationId: null,
        data: {},
        loading: false,
        error: null,
      };
      
      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Store original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      // Mock process.env
      vi.stubEnv('NODE_ENV', 'development');
      
      // Create an action that will cause an error
      const action = {
        type: createOperation.type,
        payload: {
          // Missing required properties will cause the reducer to throw
        }
      };
      
      const nextState = reducer(initialState, action);
      
      expect(nextState.error).not.toBeNull();
      expect(nextState.loading).toBe(false);
      
      // Restore mocks
      consoleErrorSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });

  // removeTable tests
  describe('removeTable reducer', () => {
    test('should remove a table node and update selectedTables', () => {
      const operationNode = { id: 'node-1', operationType: 'STACK' };
      const tableNode1 = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      const tableNode2 = { id: 'node-3', parentId: 'node-1', tableId: 'table-2' };
      
      const state = {
        selectedTables: ['table-1', 'table-2'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode1,
          'node-3': tableNode2
        },
        loading: false,
        error: null,
      };
      
      const action = removeTable('node-2');
      const nextState = reducer(state, action);
      
      expect(nextState.data['node-2']).toBeUndefined();
      expect(nextState.selectedTables).not.toContain('table-1');
      expect(nextState.selectedTables).toContain('table-2');
      expect(nextState.data['node-1']).toBeDefined(); // Operation still exists as it has another child
    });

    test('should remove operation node when removing the last table child', () => {
      const operationNode = { id: 'node-1', operationType: 'STACK' };
      const tableNode = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      
      const state = {
        selectedTables: ['table-1'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode
        },
        loading: false,
        error: null,
      };
      
      const action = removeTable('node-2');
      const nextState = reducer(state, action);
      
      expect(nextState.data['node-2']).toBeUndefined();
      expect(nextState.data['node-1']).toBeUndefined();
      expect(nextState.selectedTables).toEqual([]);
      expect(Object.keys(nextState.data).length).toBe(0);
      expect(nextState.prevOperationId).toBeNull();
    });
  });

  // removeOperation tests
  describe('removeOperation reducer', () => {
    test('should remove an operation node and all its children', () => {
      const operationNode = { id: 'node-1', operationType: 'STACK' };
      const tableNode1 = { id: 'node-2', parentId: 'node-1', tableId: 'table-1' };
      const tableNode2 = { id: 'node-3', parentId: 'node-1', tableId: 'table-2' };
      
      const state = {
        selectedTables: ['table-1', 'table-2'],
        prevOperationId: 'node-1',
        data: {
          'node-1': operationNode,
          'node-2': tableNode1,
          'node-3': tableNode2
        },
        loading: false,
        error: null,
      };
      
      const action = removeOperation('node-1');
      const nextState = reducer(state, action);
      
      expect(nextState.data['node-1']).toBeUndefined();
      expect(nextState.data['node-2']).toBeUndefined();
      expect(nextState.data['node-3']).toBeUndefined();
      expect(nextState.selectedTables).toEqual([]);
      expect(Object.keys(nextState.data).length).toBe(0);
      expect(nextState.prevOperationId).toBeNull();
    });

    test('should handle nested operation removal correctly', () => {
      // Create a hierarchical structure with nested operations
      const parentOpNode = { id: 'node-1', operationType: 'PACK' };
      const childOpNode = { id: 'node-2', parentId: 'node-1', operationType: 'STACK' };
      const tableNode1 = { id: 'node-3', parentId: 'node-2', tableId: 'table-1' };
      const tableNode2 = { id: 'node-4', parentId: 'node-2', tableId: 'table-2' };
      
      const state = {
        selectedTables: ['table-1', 'table-2'],
        prevOperationId: 'node-2',
        data: {
          'node-1': parentOpNode,
          'node-2': childOpNode,
          'node-3': tableNode1,
          'node-4': tableNode2
        },
        loading: false,
        error: null,
      };
      
      // Remove the child operation node
      const action = removeOperation('node-2');
      const nextState = reducer(state, action);
      
      expect(nextState.data['node-2']).toBeUndefined();
      expect(nextState.data['node-3']).toBeUndefined();
      expect(nextState.data['node-4']).toBeUndefined();
      
      // The parent operation should also be removed as it has no other children
      expect(nextState.data['node-1']).toBeUndefined();
      
      expect(nextState.selectedTables).toEqual([]);
      expect(Object.keys(nextState.data).length).toBe(0);
      expect(nextState.prevOperationId).toBeNull();
    });

    test('should not remove parent operation if it has other children', () => {
      // Create a structure where parent has multiple child operations
      const parentOpNode = { id: 'node-1', operationType: 'PACK' };
      const childOpNode1 = { id: 'node-2', parentId: 'node-1', operationType: 'STACK' };
      const childOpNode2 = { id: 'node-3', parentId: 'node-1', operationType: 'JOIN' };
      const tableNode1 = { id: 'node-4', parentId: 'node-2', tableId: 'table-1' };
      const tableNode2 = { id: 'node-5', parentId: 'node-3', tableId: 'table-2' };
      
      const state = {
        selectedTables: ['table-1', 'table-2'],
        prevOperationId: 'node-3',
        data: {
          'node-1': parentOpNode,
          'node-2': childOpNode1,
          'node-3': childOpNode2,
          'node-4': tableNode1,
          'node-5': tableNode2
        },
        loading: false,
        error: null,
      };
      
      // Remove one child operation node
      const action = removeOperation('node-2');
      const nextState = reducer(state, action);
      
      // The removed operation and its children should be gone
      expect(nextState.data['node-2']).toBeUndefined();
      expect(nextState.data['node-4']).toBeUndefined();
      expect(nextState.selectedTables).not.toContain('table-1');
      
      // The parent and other operation should still exist
      expect(nextState.data['node-1']).toBeDefined();
      expect(nextState.data['node-3']).toBeDefined();
      expect(nextState.data['node-5']).toBeDefined();
      expect(nextState.selectedTables).toContain('table-2');
    });
  });
});