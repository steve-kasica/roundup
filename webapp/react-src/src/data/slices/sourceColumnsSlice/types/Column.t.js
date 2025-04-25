// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import {
//   Column,
//   COLUMN_STATUS_VISABLE,
//   COLUMN_STATUS_REMOVED,
//   COLUMN_STATUS_NULLED
// } from '.';

// describe('Column Factory Function', () => {
//   // Reset the module between tests to reset the idCounter
//   beforeEach(() => {
//     // This approach requires proper module mocking to reset the idCounter
//     // You might need to adjust this based on your actual module setup
//     vi.resetModules();
//     // Re-import after reset
//     const freshModule = vi.importActual('./Column.js');
//     Object.assign(global, freshModule);
//   });

//   it('should create a column with the correct structure', () => {
//     const column = Column('table1', 0, 'Name', 'numeric');

//     expect(column).toEqual({
//       id: expect.stringMatching(/^c-\d+$/),
//       tableId: 'table1',
//       index: 0,
//       name: 'Name',
//       columnType: 'numeric',
//       status: COLUMN_STATUS_VISABLE
//     });
//   });

//   it('should increment id counter for each new column', () => {
//     const column1 = Column('table1', 0, 'Column 1', 'numeric');
//     const column2 = Column('table1', 1, 'Column 2', 'categorical');

//     // Extract the numeric part after "c-"
//     const id1 = parseInt(column1.id.substring(2));
//     const id2 = parseInt(column2.id.substring(2));

//     expect(id2).toBe(id1 + 1);
//   });

//   it('should throw error when tableId is undefined', () => {
//     expect(() => {
//       Column(undefined, 0, 'Name', 'numeric');
//     }).toThrow("Param undefined `tableId`");
//   });

//   it('should throw error when index is undefined', () => {
//     expect(() => {
//       Column('table1', undefined, 'Name', 'numeric');
//     }).toThrow("Param undefined, `index`");
//   });

//   it('should use default COLUMN_STATUS_VISABLE when status is not provided', () => {
//     const column = Column('table1', 0, 'Name', 'numeric');
//     expect(column.status).toBe(COLUMN_STATUS_VISABLE);
//   });

//   it('should accept custom status when provided', () => {
//     const column = Column('table1', 0, 'Name', 'numeric', COLUMN_STATUS_REMOVED);
//     expect(column.status).toBe(COLUMN_STATUS_REMOVED);
//   });

//   it('should handle numerical tableId', () => {
//     const column = Column(123, 0, 'Name', 'numeric');
//     expect(column.tableId).toBe(123);
//   });

//   it('should handle empty string name', () => {
//     const column = Column('table1', 0, '', 'numeric');
//     expect(column.name).toBe('');
//   });

//   it('should handle null name', () => {
//     const column = Column('table1', 0, null, 'numeric');
//     expect(column.name).toBeNull();
//   });

//   it('should handle negative index', () => {
//     const column = Column('table1', -1, 'Name', 'numeric');
//     expect(column.index).toBe(-1);
//   });

//   it('should accept any columnType string', () => {
//     const customType = 'custom-type';
//     const column = Column('table1', 0, 'Name', customType);
//     expect(column.columnType).toBe(customType);
//   });

//   it('should handle COLUMN_STATUS_NULLED', () => {
//     const column = Column('table1', 0, 'Name', 'numeric', COLUMN_STATUS_NULLED);
//     expect(column.status).toBe(COLUMN_STATUS_NULLED);
//   });

//   describe('Column with different data types', () => {
//     it('should handle object as tableId', () => {
//       const tableObj = { id: 'table1' };
//       const column = Column(tableObj, 0, 'Name', 'numeric');
//       expect(column.tableId).toBe(tableObj);
//     });

//     it('should handle undefined name', () => {
//       const column = Column('table1', 0, undefined, 'numeric');
//       expect(column.name).toBeUndefined();
//     });

//     it('should handle undefined columnType', () => {
//       const column = Column('table1', 0, 'Name', undefined);
//       expect(column.columnType).toBeUndefined();
//     });

//     it('should handle float index', () => {
//       const column = Column('table1', 1.5, 'Name', 'numeric');
//       expect(column.index).toBe(1.5);
//     });
//   });
// });
