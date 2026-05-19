import './legacy.css';
import { LegacySimulationProvider } from '../../shared/LegacySimulationContext';
import { Header } from './Header';
import { Footer } from './Footer';

export function LegacyApp() {
  return (
    <LegacySimulationProvider>
      <div className="container">
        {/* 星星背景 canvas — wired in Task 11 (StellarCanvas) */}
        <canvas id="stellar-bg"></canvas>

        <Header />

        {/* Stats panel placeholder — wired in Task 12 */}
        <div className="stats" id="stats">
          {/* Stats component goes here */}
        </div>

        <div className="content-wrapper">
          {/* 橫屏：左側選課區 — wired in Task 14 */}
          <div className="simulator-panel" id="simulator-panel">
            {/* SimulatorPanel component goes here */}
          </div>

          {/* 樹狀圖區域 — wired in Task 16 */}
          <div className="tree-panel" id="tree-panel">
            <div className="tree-header" id="tree-header">
              {/* TreePanel header buttons — wired in Task 16 */}
              <button className="header-btn" id="course-btn" title="選課 (C)">
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

      {/* 豎屏選課遮罩 — wired in Task 15 */}
      <div className="mobile-overlay" id="mobile-overlay"></div>

      {/* 豎屏選課面板（iOS Bottom Sheet）— wired in Task 15 */}
      <div className="mobile-course-panel" id="mobile-panel">
        <div className="mobile-panel-handle"></div>
        <div className="mobile-panel-header">
          <div className="mobile-panel-header-icon">📚</div>
          <div>
            <h3>114-1學期課程</h3>
            <p>點選模擬選課效果</p>
          </div>
        </div>
        <div className="mobile-panel-content">
          <div className="mobile-course-grid" id="mobile-courses"></div>
        </div>
      </div>

      {/* 快捷鍵提示 — wired in Task 20 */}
      <div className="shortcut-hint" id="shortcut-hint"></div>
    </LegacySimulationProvider>
  );
}
