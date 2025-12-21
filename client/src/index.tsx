import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // This line is vital for Tailwind to load!
import App from "./App";

// Identifying the root div in your index.html
const rootElement = document.getElementById("root") as HTMLElement;

if (!rootElement) {
  throw new Error("Root element not found. Check your public/index.html file.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);