// eslint-disable-next-line no-unused-vars
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
// eslint-disable-next-line no-unused-vars
import App from "./App.jsx";
// eslint-disable-next-line no-unused-vars
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { Provider } from "react-redux";
import "./main.css";
import "antd/dist/antd.js";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
