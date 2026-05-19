import { useLegacySimulationResult } from '../../shared/useSimulationResult';

export function Stats() {
  const result = useLegacySimulationResult();

  const earned = result.totalEarned + result.totalPending;
  const remaining = Math.max(0, 128 - earned);
  const percentage = ((earned / 128) * 100).toFixed(1);

  return (
    <>
      <div className="stat-item">
        <span className="stat-number" id="total-earned">{earned}</span>
        <span className="stat-label">已修學分</span>
        <div className="progress-bar">
          <div className="progress-fill" id="progress-bar" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#ef4444' }}>128</span>
        <span className="stat-label">畢業學分</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#f59e0b' }} id="remaining">{remaining}</span>
        <span className="stat-label">還需修習</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#10b981' }} id="completion">{percentage}%</span>
        <span className="stat-label">完成度</span>
      </div>
    </>
  );
}
