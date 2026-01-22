import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Provider from "./lib/provider.tsx";
import { Route, Routes } from "react-router";
import Assessment from "./Assessment.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assess" element={<Assessment />} />
      </Routes>
    </Provider>
  </StrictMode>,
);
