import { useEffect } from 'react';

const SCROLL_THRESHOLD = 50;

export function useScrollCollapse() {
  useEffect(() => {
    function handleScroll() {
      const stats = document.getElementById('stats');
      const treeHeader = document.getElementById('tree-header');
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > SCROLL_THRESHOLD) {
        stats?.classList.add('scrolled');
        treeHeader?.classList.add('floating');
      } else {
        stats?.classList.remove('scrolled');
        treeHeader?.classList.remove('floating');
      }
    }

    // Call once on mount in case page loads scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
