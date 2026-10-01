import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./paper.css";
import PaperApp from "./PaperApp.jsx";

// A second, fully separate entry: the Field Guide edition is served from
// design.html and shares no stylesheet with the HUD app in index.html.
createRoot(document.getElementById("paper-root")).render(
  <StrictMode>
    <PaperApp />
  </StrictMode>,
);
