import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const THEME_KEY = 'course.theme.v1';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLegacy = location.pathname.startsWith('/legacy');
  const isModern = location.pathname.startsWith('/modern');

  // Save preference when user navigates explicitly to a theme
  useEffect(() => {
    if (isLegacy) localStorage.setItem(THEME_KEY, 'legacy');
    else if (isModern) localStorage.setItem(THEME_KEY, 'modern');
  }, [isLegacy, isModern]);

  // On root path, redirect to saved theme
  useEffect(() => {
    if (location.pathname === '/') {
      const saved = localStorage.getItem(THEME_KEY) ?? 'legacy';
      navigate(`/${saved}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 text-white px-6 py-3 flex gap-4 text-sm">
        <Link to="/" className="font-bold">course.stan-shih</Link>
        <Link to="/legacy" className={isLegacy ? 'font-bold' : 'opacity-70 hover:opacity-100'}>Legacy</Link>
        <Link to="/modern" className={isModern ? 'font-bold' : 'opacity-70 hover:opacity-100'}>Modern</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
