import { useState } from 'react';
import './legacy.css';
import { LegacySimulationProvider } from '../../shared/LegacySimulationContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { StellarCanvas } from './StellarCanvas';
import { Stats } from './Stats';
import { SimulatorPanel } from './SimulatorPanel';
import { BottomSheet } from './BottomSheet';
import { useScrollCollapse } from './useScrollCollapse';

function LegacyAppInner() {
  useScrollCollapse();

  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop < 70) {
      window.scrollTo({ top: 80, behavior: 'smooth' });
      setTimeout(() => setSheetOpen(true), 350);
    } else {
      setSheetOpen(true);
    }
  };
  const closeSheet = () => setSheetOpen(false);

  return (
    <>
      <div className="container">
        {/* 星星背景 canvas — Task 11 */}
        <StellarCanvas />

        <Header />

        {/* Stats panel — Task 12 */}
        <div className="stats" id="stats">
          <Stats />
        </div>

        <div className="content-wrapper">
          {/* 橫屏：左側選課區 — Task 14 */}
          <div className="simulator-panel" id="simulator-panel">
            <SimulatorPanel />
          </div>

          {/* 樹狀圖區域 — wired in Task 16 */}
          <div className="tree-panel" id="tree-panel">
            <div className="tree-header" id="tree-header">
              {/* TreePanel header buttons — wired in Task 16 */}
              <button
                className="header-btn"
                id="course-btn"
                onClick={openSheet}
                title="選課 (C)"
              >
                📚
              </button>
              <div className="tree-header-title">畢業學分架構</div>
              <button className="header-btn" id="fullscreen-btn" title="全螢幕 (F)">
                ⛶
              </button>
            </div>

            <div id="tree-container">
              {/* TreePanel content — wired in Task 16 */}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* 豎屏選課遮罩 + 面板（iOS Bottom Sheet）— Task 15 */}
      <BottomSheet isOpen={sheetOpen} onClose={closeSheet} />

      {/* 快捷鍵提示 — wired in Task 20 */}
      <div className="shortcut-hint" id="shortcut-hint"></div>
    </>
  );
}

export function LegacyApp() {
  return (
    <LegacySimulationProvider>
      <LegacyAppInner />
    </LegacySimulationProvider>
  );
}
