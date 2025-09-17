import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import { BrowserRouter } from "react-router-dom";

test("renders login form", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  // heading and button both contain 'Sign in'; assert heading text specifically
  expect(screen.getByRole("heading", { name: /Sign in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
});

// Basic submit behaviour (mock fetch)
test("submits login and stores token", async () => {
  const fakeToken = "tok123";
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: fakeToken }),
    })
  );
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  fireEvent.change(screen.getByPlaceholderText("username"), {
    target: { value: "admin" },
  });
  fireEvent.change(screen.getByPlaceholderText("password"), {
    target: { value: "adminpass" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));
  // wait for async state updates and effects to complete
  await waitFor(() => {
    expect(localStorage.getItem("bb_token")).toBe(fakeToken);
  });
  global.fetch.mockRestore && global.fetch.mockRestore();
});
