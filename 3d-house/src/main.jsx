import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { useTourStore } from './stores/tourStore.js';
import { input, playerState } from './utils/input.js';

// כלי בדיקה/QA — בסביבת פיתוח בלבד, לא נכלל ב-production build
if (import.meta.env.DEV) {
  window.__tour = { store: useTourStore, input, playerState };
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
