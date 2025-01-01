# Matrix Operations
This module provides a suite of utility function for manipulating a two-dimensional array, matrix, storing arbitrary Object instances in JavaScript. It allows users to modify a matrix in-place by adding, removing, or updating rows, columns, and individual cells. Designed with error handling and matrix resizing in mind, this module ensures robust and flexible matrix operations suitable for various computational and data manipulation tasks.

This module is inteded to provide a high-level API for interacting with serializable data grids or tables in web applications. it is not intended for matrix operations for [web-based graphics](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web), scientific, mathemaical, or financial computing.

This module is lightweight, easy to integrate, and follows modern JavaScript practices, making it a versatile tool for developers.

## Key Features:

1. Matrix Size Handling:
   1. Automatically adjusts the size of rows and columns during insertion or updates.
   2. Provides matrix size information via the getSize utility.
2. Row Operations:
   1. `addRow`: Adds a new row at a specified index, resizing the matrix as needed.
   2. `removeRow`: Removes a row at the specified index.
   3. `updateRow`: Updates a row with a new vector, ensuring size consistency.
3. Column Operations:
   1. `addColumn`: Inserts a column at a specified index, resizing the matrix as necessary.
   2. `removeColumn`: Removes a column at the specified index.
   3. `updateColumn`: Updates a column with a new vector, ensuring size consistency.
4. Cell Operations:
   1. `updateCell`: Updates the value of a specific cell in the matrix.
5. Error Handling:
   1. Validates input parameters to prevent out-of-bounds operations or undefined values.
   2. Provides descriptive error messages for debugging and safe usage.