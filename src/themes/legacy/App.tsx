import { Stats } from './components/Stats';
import { Sidebar } from './components/Sidebar';
import { CreditTree } from './components/CreditTree';
import { GapAdvisor } from './components/GapAdvisor';

export function LegacyApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legacy-start to-legacy-end font-zhengHei">
      <header className="text-white text-center py-6">
        <h1 className="text-3xl font-bold">🎓 國立臺灣師範大學資工系 畢業學分檢核系統</h1>
        <p className="text-sm opacity-80 mt-1">110 學年度入學適用（112.09.22 修訂）</p>
      </header>
      <Stats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4">
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
        <div className="lg:col-span-2">
          <CreditTree />
          <GapAdvisor />
        </div>
      </div>
    </div>
  );
}
