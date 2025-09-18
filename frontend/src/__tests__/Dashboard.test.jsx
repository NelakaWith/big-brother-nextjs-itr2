import { render, screen } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { BrowserRouter } from "react-router-dom";

test("renders apps header", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
  expect(await screen.findByText(/Apps/)).toBeInTheDocument();
  global.fetch.mockRestore && global.fetch.mockRestore();
});
