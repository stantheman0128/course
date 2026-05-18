import { Stats } from './components/Stats';
import { Sidebar } from './components/Sidebar';
import { CreditTree } from './components/CreditTree';
import { GapAdvisor } from './components/GapAdvisor';

export function ModernApp() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="mb-6">
          <h1 className="text-2xl font-light tracking-tight">course · stan-shih</h1>
          <p className="text-xs text-gray-500 mt-1">NTNU CS · 110 cohort (112.09.22 amended)</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Stats />
          </div>
          <div className="lg:col-span-2">
            <Sidebar />
          </div>
        </div>
        <CreditTree />
        <GapAdvisor />
      </div>
    </div>
  );
}
