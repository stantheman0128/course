import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './shared/Layout';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import { SimulationProvider } from './shared/SimulationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/legacy" replace />} />
            <Route path="/legacy" element={<LegacyApp />} />
            <Route path="/modern" element={<ModernApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  </StrictMode>,
);
