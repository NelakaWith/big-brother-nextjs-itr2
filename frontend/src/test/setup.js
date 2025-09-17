import "@testing-library/jest-dom";

// Provide a `jest` alias for tests that use jest.fn() etc.
// Vitest exposes `vi` as the global mock function provider.
if (
  typeof globalThis.jest === "undefined" &&
  typeof globalThis.vi !== "undefined"
) {
  // eslint-disable-next-line no-undef
  globalThis.jest = globalThis.vi;
}

// Some older tests rely on `React` being globally available (JSX runtime differences).
import React from "react";
if (typeof globalThis.React === "undefined") globalThis.React = React;
