import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the reducer and action creators
import reducer, { 
    fetchMultipleRequest, 
    fetchMultipleSuccess, 
    fetchMultipleFailure,
    fetchSingleRequest,
    fetchSingleSuccess,
    fetchSingleFailure
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
  });
});