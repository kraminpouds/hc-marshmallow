import './index.css'
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';

const container = document.getElementById("root");

if (import.meta.hot || !container?.innerText) {
    const root = createRoot(container!);
    root.render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
} else {
    hydrateRoot(container!, <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
}
