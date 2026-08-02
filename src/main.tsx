import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerAppServiceWorker } from './lib/serviceWorker'

registerAppServiceWorker().catch((error) => {
  console.warn("Service worker indisponible :", error);
});

createRoot(document.getElementById("root")!).render(<App />);
