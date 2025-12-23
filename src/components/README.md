# Components

### Design Principles Applied:

- Consistent Color Theme: All components use Material-UI's warning colors (orange/amber)
- Visual Hierarchy: Alert indicators are prominent but don't completely override other states
- Component-Appropriate Design:
  - List items get left borders and icons
  - Row items get subtle backgrounds and accents
  - Container components get full borders
  - Labels get badges and background highlighting
- Progressive Enhancement: Alerts add visual weight without breaking existing UI patterns
- Accessibility: Color is paired with icons (Warning icon) for better accessibility

- Each React component that displays data is contained in a module that exports both an enhanced (exported wrapped in an HOC and plain version). Decoupling the data preparation from presentation allows use to easily navigate cases where we want to use the same graphical elements without binding them to state, e.g. when depicting null values or in drag "ghosts" when dragging and dropping elements in the interface.
