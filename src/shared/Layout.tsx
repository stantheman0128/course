import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const isLegacy = location.pathname.startsWith('/legacy');
  const isModern = location.pathname.startsWith('/modern');

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 text-white px-6 py-3 flex gap-4">
        <Link to="/" className="font-bold">course.stan-shih</Link>
        <Link to="/legacy" className={isLegacy ? 'font-bold' : 'opacity-70'}>Legacy</Link>
        <Link to="/modern" className={isModern ? 'font-bold' : 'opacity-70'}>Modern</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
