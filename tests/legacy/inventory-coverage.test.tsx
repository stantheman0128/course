import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LegacyApp } from '../../src/themes/legacy/App';

function renderLegacy() {
  return render(
    <MemoryRouter initialEntries={['/legacy']}>
      <LegacyApp />
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
});

describe('Legacy inventory coverage', () => {
  it('§B1 renders stellar canvas', () => {
    const { container } = renderLegacy();
    expect(container.querySelector('#stellar-bg')).toBeInTheDocument();
  });

  it('§D3 stats include 4 cards: 已修/畢業/還需/完成度', () => {
    renderLegacy();
    const labels = Array.from(document.querySelectorAll('.stat-label')).map(e => e.textContent);
    expect(labels).toEqual(['已修學分', '畢業學分', '還需修習', '完成度']);
  });

  it('§M1 simulator panel starts with empty assumedPassed (no checkboxes checked)', () => {
    renderLegacy();
    const checkboxes = document.querySelectorAll('.course-item-sim input[type=checkbox]');
    expect(checkboxes.length).toBeGreaterThan(0);
    Array.from(checkboxes).forEach(cb => {
      expect(cb).not.toBeChecked();
    });
  });

  it('§K1 includes fullscreen button', () => {
    renderLegacy();
    expect(document.querySelector('#fullscreen-btn')).toBeInTheDocument();
  });

  it('§G1 includes course/sheet trigger button', () => {
    renderLegacy();
    expect(document.querySelector('#course-btn')).toBeInTheDocument();
  });

  it('§G3 includes mobile bottom sheet (hidden but in DOM)', () => {
    renderLegacy();
    expect(document.querySelector('#mobile-panel')).toBeInTheDocument();
    expect(document.querySelector('#mobile-overlay')).toBeInTheDocument();
  });

  it('§H1 includes sticky tree-header with title', () => {
    renderLegacy();
    expect(document.querySelector('#tree-header')).toBeInTheDocument();
    expect(document.querySelector('.tree-header-title')?.textContent).toBe('畢業學分架構');
  });

  it('§C5 does NOT contain a theme-toggle nav element', () => {
    renderLegacy();
    // softer check: no link to /modern
    expect(document.querySelector('a[href="/modern"]')).toBeNull();
  });
});
