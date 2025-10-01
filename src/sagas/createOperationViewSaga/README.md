# CreateOperationViewSaga Tests

This test suite provides comprehensive coverage for the `createOperationViewSaga` including all worker functions and edge cases.

## Test Coverage

### Main Worker Function

- ✅ **NO_OP Operations**: Skips processing for NO_OP operation types
- ✅ **STACK Operations**: Creates stack views with proper column mapping
- ✅ **PACK Operations**: Creates pack views with flattened column structure
- ✅ **Error Handling**: Handles database errors and validation failures
- ✅ **Success Flow**: Clears previous errors and dispatches success actions

### Edge Cases

- ✅ **Empty Operations**: Handles operations with no children
- ✅ **Missing Columns**: Gracefully handles missing column data
- ✅ **Dimension Validation**: Validates row and column counts
- ✅ **Error Recovery**: Clears previous errors on successful operations

### Integration Tests

- ✅ **Complete Flow**: Tests end-to-end operation creation
- ✅ **State Management**: Verifies correct Redux state updates
- ✅ **Action Dispatching**: Ensures proper action sequence

## Running Tests

```bash
# Run all tests
npm test

# Run only this saga's tests
npm test createOperationViewSaga

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

The tests use:

- **vitest** as the test runner
- **redux-saga-test-plan** for saga testing utilities
- **expectSaga** for declarative saga testing
- **matchers** for mocking selectors and effects

## Key Testing Patterns

### Mocking Selectors

```javascript
.provide([
  [matchers.select(selectOperation, "op-1"), mockOperation],
  [matchers.select(selectQueryData, "op-1"), mockQueryData],
])
```

### Testing Side Effects

```javascript
.put(addColumns(mockColumns))
.call(createStackView, mockQueryData, expectedColumnIds)
```

### Error Testing

```javascript
[
  matchers.call(createStackView, mockQueryData, expect.any(Array)),
  throwError(dbError),
];
```

## Mock Data

The tests use consistent mock data structures:

- **Operations**: Include id, operationType, and children
- **Columns**: Include id, name, and columnType
- **Query Data**: Structured data for database operations
- **Dimensions**: Row and column count validation data

## Adding New Tests

When adding new operation types or modifying existing functionality:

1. Add test cases for the new operation type
2. Mock any new selectors or database calls
3. Verify the expected actions are dispatched
4. Test error scenarios for the new functionality

## Debugging Tests

If tests fail:

1. Check the mock data matches expected structure
2. Verify selector mocks return correct data
3. Ensure database mocks are properly configured
4. Check that expected actions match actual dispatched actions
