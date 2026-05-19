import { useState, useEffect, useCallback } from 'react';
import './legacy.css';
import { LegacySimulationProvider } from '../../shared/LegacySimulationContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { StellarCanvas } from './StellarCanvas';
import { Stats } from './Stats';
import { SimulatorPanel } from './SimulatorPanel';
import { BottomSheet } from './BottomSheet';
import { TreePanel } from './TreePanel';
import { ShortcutHint } from './ShortcutHint';
import { useScrollCollapse } from './useScrollCollapse';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function LegacyAppInner() {
  useScrollCollapse();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Task 19: sync body class with fullscreen state
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
    return () => {
      document.body.classList.remove('fullscreen-mode');
    };
  }, [isFullscreen]);

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

  // Task 21: toggleFullscreen now also fires the hint toast
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      setHint(next ? '全螢幕模式' : '退出全螢幕');
      setTimeout(() => setHint(null), 1500);
      return next;
    });
  }, []);

  // Task 20: keyboard shortcuts
  const handleEscape = useCallback(() => {
    if (sheetOpen) closeSheet();
    if (isFullscreen) toggleFullscreen();
  }, [sheetOpen, isFullscreen, toggleFullscreen]);

  useKeyboardShortcuts({
    onToggleFullscreen: toggleFullscreen,
    onToggleSheet: sheetOpen ? closeSheet : openSheet,
    onEscape: handleEscape,
  });

  return (
    <>
      <div className="container">
        {/* 星星背景 canvas — Task 11 / 19: portal into tree-panel when fullscreen */}
        <StellarCanvas containerSelector={isFullscreen ? '#tree-panel' : undefined} />

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

          {/* 樹狀圖區域 — Task 16 */}
          <div
            className={`tree-panel${isFullscreen ? ' fullscreen' : ''}`}
            id="tree-panel"
          >
            <TreePanel
              onOpenSheet={openSheet}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>

        <Footer />
      </div>

      {/* 豎屏選課遮罩 + 面板（iOS Bottom Sheet）— Task 15 */}
      <BottomSheet isOpen={sheetOpen} onClose={closeSheet} />

      {/* 快捷鍵提示 — Task 21 */}
      <ShortcutHint text={hint} />
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
