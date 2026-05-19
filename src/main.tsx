import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/legacy" replace />} />
        <Route path="/legacy" element={<LegacyApp />} />
        <Route path="/modern" element={<ModernApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
