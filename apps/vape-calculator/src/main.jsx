import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Only the calculator's own /vape-calculator/ scope is controlled offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("/vape-calculator/sw.js",{scope:"/vape-calculator/"}).catch(()=>{});
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
