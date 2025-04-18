import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the reducer and action creators
import reducer, { 
    fetchMultipleRequest, 
    fetchMultipleSuccess, 
    fetchMultipleFailure,

    fetchSingleRequest,
    fetchSingleSuccess,
    fetchSingleFailure,

    removeColumnRequest,
    removeColumnSuccess,
    removeColumnFailure
} from '.';

import { 
  Column, 
  COLUMN_STATUS_VISABLE, 
  COLUMN_STATUS_REMOVED, 
  COLUMN_STATUS_NULLED 
} from '.';

describe('sourceColumns slice', () => {
  // Save the original process.env and console methods
  const originalEnv = process.env;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Reset process.env
    process.env = { ...originalEnv };
    // Mock console.error
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      ids: [],
      data: {},
      loading: false,
      error: null
    });
  });

  describe('fetchMultipleRequest', () => {
    it('should set loading to true and clear errors', () => {
      const initialState = {
        ids: [],
        data: {},
        loading: false,
        error: 'Previous error'
      };

      const nextState = reducer(initialState, fetchMultipleRequest());
      
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
    });
  });

  describe('fetchMultipleSuccess', () => {
    it('should set loading to false and clear errors', () => {
      const initialState = {
        ids: [],
        data: {},
        loading: true,
        error: 'Previous error'
      };

      const nextState = reducer(initialState, fetchMultipleSuccess());
      
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeNull();
    });
  });

  describe('fetchMultipleFailure', () => {
    it('should set loading to false and set error from payload', () => {
      const initialState = {
        ids: [],
        data: {},
        loading: true,
        error: null
      };

      const error = 'Error message';
      const nextState = reducer(initialState, fetchMultipleFailure(error));
      
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe(error);
    });

    it('should log error in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const error = 'Error message';
      reducer(
        { loading: true, error: null, ids: [], data: {} },
        fetchMultipleFailure(error)
      );
      
      expect(console.error).toHaveBeenCalledWith('Error fetching columns', expect.any(Object));
    });

    it('should not log error in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const error = 'Error message';
      reducer(
        { loading: true, error: null, ids: [], data: {} },
        fetchMultipleFailure(error)
      );
      
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('fetchSingleRequest', () => {
    it('should initialize project data with loading state', () => {
      const initialState = {
        ids: [],
        data: {},
        loading: false,
        error: null
      };

      const projectId = 'project123';
      const nextState = reducer(initialState, fetchSingleRequest(projectId));
      
      expect(nextState.data[projectId]).toEqual({
        loading: true,
        error: null,
        columns: []
      });
    });
  });

  describe('fetchSingleSuccess', () => {
    it('should update state with columns data for a specific project', () => {
      const projectId = 'project123';
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: true,
            error: null,
            columns: []
          }
        },
        loading: false,
        error: null
      };

      const columnsInfo = [
        { name: 'Column 1', is_numeric: true },
        { name: 'Column 2', is_numeric: false }
      ];

      const nextState = reducer(
        initialState,
        fetchSingleSuccess({ response: columnsInfo, projectId })
      );
      
      expect(nextState.data[projectId].loading).toBe(false);
      expect(nextState.data[projectId].error).toBeNull();
      expect(nextState.data[projectId].columns).toHaveLength(2);
      
      // Check column properties
      expect(nextState.data[projectId].columns[0]).toEqual({
        id: 'c-1',
        tableId: projectId,
        index: 0,
        name: 'Column 1',
        columnType: 'categorical', // Note: is_numeric: true maps to "categorical" in the slice
        status: COLUMN_STATUS_VISABLE
      });
      
      expect(nextState.data[projectId].columns[1]).toEqual({
        id: 'c-2',
        tableId: projectId,
        index: 1,
        name: 'Column 2',
        columnType: 'numeric', // Note: is_numeric: false maps to "numeric" in the slice
        status: COLUMN_STATUS_VISABLE
      });
    });

    it('should handle empty columnsInfo array', () => {
      const projectId = 'project123';
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: true,
            error: null,
            columns: [{ id: 'existing', name: 'Existing' }]
          }
        },
        loading: false,
        error: null
      };

      const nextState = reducer(
        initialState,
        fetchSingleSuccess({ response: [], projectId })
      );
      
      expect(nextState.data[projectId].loading).toBe(false);
      expect(nextState.data[projectId].error).toBeNull();
      expect(nextState.data[projectId].columns).toEqual([]);
    });
  });

  describe('fetchSingleFailure', () => {
    it('should set project data to error state', () => {
      const projectId = 'project123';
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: true,
            error: null,
            columns: [{ id: 1, name: 'Existing Column' }]
          }
        },
        loading: false,
        error: null
      };

      const error = 'Error fetching columns for project';
      const nextState = reducer(
        initialState,
        fetchSingleFailure({ error, projectId })
      );
      
      expect(nextState.data[projectId].loading).toBe(false);
      expect(nextState.data[projectId].error).toBe(error);
      expect(nextState.data[projectId].columns).toEqual([]);
    });

    it('should log error in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const projectId = 'project123';
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: true,
            error: null,
            columns: []
          }
        },
        loading: false,
        error: null
      };

      const error = 'Error message';
      reducer(
        initialState,
        fetchSingleFailure({ error, projectId })
      );
      
      expect(console.error).toHaveBeenCalledWith('Error fetching columns', expect.any(Object));
    });

    it('should not log error in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const projectId = 'project123';
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: true,
            error: null,
            columns: []
          }
        },
        loading: false,
        error: null
      };

      const error = 'Error message';
      reducer(
        initialState,
        fetchSingleFailure({ error, projectId })
      );
      
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  // Test action creators
  describe('action creators', () => {
    it('should create fetchMultipleRequest action', () => {
      expect(fetchMultipleRequest()).toEqual({
        type: expect.stringContaining('/fetchMultipleRequest'),
        payload: undefined
      });
    });

    it('should create fetchMultipleSuccess action', () => {
      expect(fetchMultipleSuccess()).toEqual({
        type: expect.stringContaining('/fetchMultipleSuccess'),
        payload: undefined
      });
    });

    it('should create fetchMultipleFailure action', () => {
      const error = 'Error message';
      expect(fetchMultipleFailure(error)).toEqual({
        type: expect.stringContaining('/fetchMultipleFailure'),
        payload: error
      });
    });

    it('should create fetchSingleRequest action', () => {
      const projectId = 'project123';
      expect(fetchSingleRequest(projectId)).toEqual({
        type: expect.stringContaining('/fetchSingleRequest'),
        payload: projectId
      });
    });

    it('should create fetchSingleSuccess action', () => {
      const payload = { response: [], projectId: 'project123' };
      expect(fetchSingleSuccess(payload)).toEqual({
        type: expect.stringContaining('/fetchSingleSuccess'),
        payload
      });
    });

    it('should create fetchSingleFailure action', () => {
      const payload = { error: 'Error message', projectId: 'project123' };
      expect(fetchSingleFailure(payload)).toEqual({
        type: expect.stringContaining('/fetchSingleFailure'),
        payload
      });
    });
    
    // New action creators for column removal
    it('should create removeColumnRequest action', () => {
      const payload = { projectId: 'project123', columnIndex: 1 };
      expect(removeColumnRequest(payload)).toEqual({
        type: expect.stringContaining('/removeColumnRequest'),
        payload
      });
    });
    
    it('should create removeColumnSuccess action', () => {
      const payload = { projectId: 'project123', columnIndex: 1 };
      expect(removeColumnSuccess(payload)).toEqual({
        type: expect.stringContaining('/removeColumnSuccess'),
        payload
      });
    });
    
    it('should create removeColumnFailure action', () => {
      const payload = { projectId: 'project123', columnIndex: 1, error: 'Error message' };
      expect(removeColumnFailure(payload)).toEqual({
        type: expect.stringContaining('/removeColumnFailure'),
        payload
      });
    });
  });
  
  // New tests for column removal functionality
  describe('removeColumnRequest', () => {
    it('should set loading state for specific column', () => {
      const projectId = 'project123';
      const columnIndex = 1;
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' },
              { id: 'c-2', loading: false, error: null, name: 'Column 2' },
              { id: 'c-3', loading: false, error: null, name: 'Column 3' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      const nextState = reducer(
        initialState,
        removeColumnRequest({ projectId, columnIndex })
      );
      
      // The specified column should be in loading state
      expect(nextState.data[projectId].columns[columnIndex].loading).toBe(true);
      expect(nextState.data[projectId].columns[columnIndex].error).toBeNull();
      
      // Other columns should remain untouched
      expect(nextState.data[projectId].columns[0].loading).toBe(false);
      expect(nextState.data[projectId].columns[2].loading).toBe(false);
    });
    
    it('should handle gracefully when column does not exist', () => {
      const projectId = 'project123';
      const nonExistentIndex = 999;
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      // This should not throw an error
      const nextState = reducer(
        initialState,
        removeColumnRequest({ projectId, columnIndex: nonExistentIndex })
      );
      
      // State should remain unchanged
      expect(nextState).toEqual(initialState);
    });
  });
  
  describe('removeColumnSuccess', () => {
    it('should remove the specified column', () => {
      const projectId = 'project123';
      const columnIndex = 1;
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' },
              { id: 'c-2', loading: true, error: null, name: 'Column 2' },
              { id: 'c-3', loading: false, error: null, name: 'Column 3' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      const nextState = reducer(
        initialState,
        removeColumnSuccess({ projectId, columnIndex })
      );
      
      // Verify column is removed
      expect(nextState.data[projectId].columns.map(col => col.id)).not.toContain('c-2');
      expect(nextState.data[projectId].columns).toHaveLength(2);
      expect(nextState.data[projectId].columns[0].id).toBe('c-1');
      expect(nextState.data[projectId].columns[1].id).toBe('c-3');
    });
    
    it('should handle gracefully when column does not exist', () => {
      const projectId = 'project123';
      const nonExistentIndex = 999;
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      // This should not throw an error
      const nextState = reducer(
        initialState,
        removeColumnSuccess({ projectId, columnIndex: nonExistentIndex })
      );
      
      // State should remain unchanged
      expect(nextState).toEqual(initialState);
    });
  });
  
  describe('removeColumnFailure', () => {
    it('should set error and reset loading for the column', () => {
      const projectId = 'project123';
      const columnIndex = 1;
      const error = 'Error removing column';
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' },
              { id: 'c-2', loading: true, error: null, name: 'Column 2' },
              { id: 'c-3', loading: false, error: null, name: 'Column 3' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      const nextState = reducer(
        initialState,
        removeColumnFailure({ projectId, columnIndex, error })
      );
      
      // The specified column should have error set and loading reset
      expect(nextState.data[projectId].columns[columnIndex].loading).toBe(false);
      expect(nextState.data[projectId].columns[columnIndex].error).toBe(error);
      
      // The column should still exist
      expect(nextState.data[projectId].columns[columnIndex].name).toBe('Column 2');
      
      // Other columns should remain untouched
      expect(nextState.data[projectId].columns[0].error).toBeNull();
      expect(nextState.data[projectId].columns[2].error).toBeNull();
    });
    
    it('should handle gracefully when column does not exist', () => {
      const projectId = 'project123';
      const nonExistentIndex = 999;
      const error = 'Error removing column';
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      // This should not throw an error
      const nextState = reducer(
        initialState,
        removeColumnFailure({ projectId, columnIndex: nonExistentIndex, error })
      );
      
      // State should remain unchanged
      expect(nextState).toEqual(initialState);
    });
  });
  
  // Test the complete column removal workflow
  describe('column removal workflow', () => {
    it('should handle successful column removal workflow', () => {
      const projectId = 'project123';
      const columnIndex = 1;
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' },
              { id: 'c-2', loading: false, error: null, name: 'Column 2' },
              { id: 'c-3', loading: false, error: null, name: 'Column 3' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      // Step 1: Start column removal
      let state = reducer(
        initialState,
        removeColumnRequest({ projectId, columnIndex })
      );
      
      // Verify column is in loading state
      expect(state.data[projectId].columns[columnIndex].loading).toBe(true);
      expect(state.data[projectId].columns[columnIndex].error).toBeNull();
      
      // Step 2: Complete column removal
      state = reducer(
        state,
        removeColumnSuccess({ projectId, columnIndex })
      );
      
      // Verify column is removed
      expect(state.data[projectId].columns.map(col => col.id)).not.toContain('c-2');
      expect(state.data[projectId].columns).toHaveLength(2);
      expect(state.data[projectId].columns[0].id).toBe('c-1');
      expect(state.data[projectId].columns[1].id).toBe('c-3');
    });
    
    it('should handle failed column removal workflow', () => {
      const projectId = 'project123';
      const columnIndex = 1;
      const error = 'Error removing column';
      
      // Create initial state with columns
      const initialState = {
        ids: [],
        data: {
          [projectId]: {
            loading: false,
            error: null,
            columns: [
              { id: 'c-1', loading: false, error: null, name: 'Column 1' },
              { id: 'c-2', loading: false, error: null, name: 'Column 2' },
              { id: 'c-3', loading: false, error: null, name: 'Column 3' }
            ]
          }
        },
        loading: false,
        error: null
      };
      
      // Step 1: Start column removal
      let state = reducer(
        initialState,
        removeColumnRequest({ projectId, columnIndex })
      );
      
      // Verify column is in loading state
      expect(state.data[projectId].columns[columnIndex].loading).toBe(true);
      
      // Step 2: Column removal fails
      state = reducer(
        state,
        removeColumnFailure({ projectId, columnIndex, error })
      );
      
      // Verify column still exists but has error
      expect(state.data[projectId].columns[columnIndex]).toBeDefined();
      expect(state.data[projectId].columns[columnIndex].loading).toBe(false);
      expect(state.data[projectId].columns[columnIndex].error).toBe(error);
      expect(state.data[projectId].columns[columnIndex].name).toBe('Column 2');
    });
  });
});