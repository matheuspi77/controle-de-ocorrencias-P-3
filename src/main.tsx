import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Importa o App principal

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

// Renderiza o App completo
root.render(<App />);
