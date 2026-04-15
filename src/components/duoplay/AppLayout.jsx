import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { TAB_ROOTS, useTabNav } from '@/lib/tabNavContext.jsx';

export default function AppLayout() {
  const location = useLocation();
  const { recordVisit } = useTabNav();

  // Map of path → scrollY, persisted across tab switches
  const scrollPositions = useRef({});
  const containerRef = useRef(null);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const leaving = prevPath.current;
    const arriving = location.pathname;

    // Record visit so TabNavContext can restore it on re-select
    recordVisit(arriving);

    // Save scroll of the tab we're leaving
    if (TAB_ROOTS.includes(leaving)) {
      scrollPositions.current[leaving] = container.scrollTop;
    }

    // Restore scroll of the tab we're arriving at (0 if first visit)
    if (TAB_ROOTS.includes(arriving)) {
      const saved = scrollPositions.current[arriving] ?? 0;
      requestAnimationFrame(() => {
        if (containerRef.current) containerRef.current.scrollTop = saved;
      });
    }

    prevPath.current = arriving;
  }, [location.pathname, recordVisit]);

  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      {/* Scrollable content area — reserve bottom-nav space to prevent layout shift */}
      <div ref={containerRef} className="min-h-screen overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Reserve nav height (64px) + safe area so content is never hidden behind nav */}
        <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
          <Outlet />
        </div>
      </div>
      <BottomNav scrollContainerRef={containerRef} />
    </div>
  );
}