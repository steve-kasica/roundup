import { describe, it, expect } from 'vitest';
import reducer, {fetchTablesRequest, fetchTablesSuccess, fetchTablesFailure, SourceTable, isSourceTable} from '.';

describe('sourceTablesSlice', () => {
  // Initial state for reference in tests
  const initialState = {
    ids: [],
    data: {},
    loading: false,
    error: null
  };

  // Mock data to use in tests
  const mockTableData = {
    'table1': {
      name: 'Users',
      rowCount: '1000',
      columnCount: '10',
      created: '2023-01-01',
      modified: '2023-02-01',
      tags: ['users', 'data']
    },
    'table2': {
      name: 'Products',
      rowCount: '500',
      columnCount: '15',
      created: '2023-01-15',
      modified: '2023-02-15',
      tags: ['products', 'inventory']
    }
  };

  // Mock error message
  const mockError = 'Failed to fetch tables';

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('fetchTablesRequest', () => {
    it('should set loading to true and clear any errors', () => {
      // Arrange: start with an initial state that has an error
      const startState = {
        ...initialState,
        error: 'Previous error'
      };

      // Act: dispatch fetchTablesRequest action
      const nextState = reducer(startState, fetchTablesRequest());

      // Assert: verify state was updated correctly
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
      expect(nextState.ids).toEqual([]);
      expect(nextState.data).toEqual({});
    });
  });

  describe('fetchTablesSuccess', () => {
    it('should update state with fetched tables and set loading to false', () => {
      // Arrange: start with loading state
      const startState = {
        ...initialState,
        loading: true
      };

      // Act: dispatch fetchTablesSuccess with mock data
      const nextState = reducer(startState, fetchTablesSuccess(mockTableData));

      // Assert: verify state was updated correctly
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeNull();
      expect(nextState.ids).toEqual(['table1', 'table2']);
      
      // Check that data was transformed correctly
      expect(isSourceTable(nextState.data.table1)).toBeTruthy;
      expect(isSourceTable(nextState.data.table2)).toBeTruthy;      
      
      // Verify specific properties of the SourceTable instances
      expect(nextState.data.table1.id).toBe('table1');
      expect(nextState.data.table1.name).toBe('Users');
      expect(nextState.data.table1.rowCount).toBe(1000);
      expect(nextState.data.table1.columnCount).toBe(10);
      expect(nextState.data.table1.dateCreated).toBe('2023-01-01');
      expect(nextState.data.table1.dateLastModified).toBe('2023-02-01');
      expect(nextState.data.table1.tags).toEqual(['users', 'data']);
      
      expect(nextState.data.table2.id).toBe('table2');
      expect(nextState.data.table2.name).toBe('Products');
      expect(nextState.data.table2.rowCount).toBe(500);
      expect(nextState.data.table2.columnCount).toBe(15);
      expect(nextState.data.table2.dateCreated).toBe('2023-01-15');
      expect(nextState.data.table2.dateLastModified).toBe('2023-02-15');
      expect(nextState.data.table2.tags).toEqual(['products', 'inventory']);
    });

    it('should handle empty tables data', () => {
      // Arrange: start with loading state
      const startState = {
        ...initialState,
        loading: true
      };

      // Act: dispatch fetchTablesSuccess with empty data
      const nextState = reducer(startState, fetchTablesSuccess({}));

      // Assert: verify state was updated correctly
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeNull();
      expect(nextState.ids).toEqual([]);
      expect(nextState.data).toEqual({});
    });
  });

  describe('fetchTablesFailure', () => {
    it('should set error and set loading to false', () => {
      // Arrange: start with loading state
      const startState = {
        ...initialState,
        loading: true
      };

      // Act: dispatch fetchTablesFailure with error message
      const nextState = reducer(startState, fetchTablesFailure(mockError));

      // Assert: verify state was updated correctly
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe(mockError);
      expect(nextState.ids).toEqual([]);
      expect(nextState.data).toEqual({});
    });
  });

  describe('integration tests', () => {
    it('should handle a complete fetch cycle', () => {
      // Start with initial state
      let state = initialState;
      
      // 1. Request starts
      state = reducer(state, fetchTablesRequest());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      
      // 2. Request succeeds
      state = reducer(state, fetchTablesSuccess(mockTableData));
      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['table1', 'table2']);
      expect(Object.keys(state.data).length).toBe(2);
      
      // 3. Another request starts
      state = reducer(state, fetchTablesRequest());
      expect(state.loading).toBe(true);
      // Data should still be present
      expect(state.ids).toEqual(['table1', 'table2']);
      
      // 4. Request fails
      state = reducer(state, fetchTablesFailure(mockError));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(mockError);
      // Data should still be present even after error
      expect(state.ids).toEqual(['table1', 'table2']);
    });
  });
});