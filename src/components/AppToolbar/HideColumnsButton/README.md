# Hide Columns Button

The hide columns button visually removes columns from the interface without deleting any data. This is useful for decluttering the view and focusing on relevant information. It's behavior is depends upon whether or not the focused object is a table or an operation, whether the focused object has any selected columns, and whether those selected columns are already hidden. So the Cypress tests in this module cover all $2^3$ possible states (8 total) to ensure correct functionality in each case.
