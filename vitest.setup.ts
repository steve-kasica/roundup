/**
 * @fileoverview Vitest test environment setup.
 * @module vitest.setup
 *
 * Configures the test environment before each test file runs.
 * Extends Vitest matchers with jest-dom for DOM assertions.
 *
 * Features:
 * - jest-dom matchers (toBeInTheDocument, toHaveClass, etc.)
 * - DOM element visibility and accessibility assertions
 * - Form element state matchers
 */
import "@testing-library/jest-dom";
