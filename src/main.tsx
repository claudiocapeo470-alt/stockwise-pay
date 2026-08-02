import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerAppServiceWorker } from './lib/serviceWorker'

registerAppServiceWorker().catch((error) => {
  console.warn("Service worker indisponible :", error);
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Conteneur React introuvable");
createRoot(rootElement).render(<App />);
