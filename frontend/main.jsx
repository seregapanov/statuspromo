// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';         // ✅ так нормально (в корне)
import './index.css';            // ✅ так нормально

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);