import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onToggleFullscreen: () => void;
  onToggleSheet: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts({
  onToggleFullscreen,
  onToggleSheet,
  onEscape,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onToggleFullscreen();
      } else if (e.key.toLowerCase() === 'c') {
        if (window.innerWidth < 1200) {
          e.preventDefault();
          onToggleSheet();
        }
      } else if (e.key === 'Escape') {
        onEscape();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleFullscreen, onToggleSheet, onEscape]);
}
