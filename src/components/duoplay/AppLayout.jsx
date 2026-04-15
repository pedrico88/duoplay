import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

// Tab roots — used to decide when to preserve/restore scroll
const TAB_ROOTS = ['/', '/games', '/scores', '/profile', '/settings'];

export default function AppLayout() {
  const location = useLocation();
  // Map of path → scrollY, persisted across tab switches
  const scrollPositions = useRef({});
  const containerRef = useRef(null);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const leaving = prevPath.current;
    const arriving = location.pathname;

    // Save scroll of the tab we're leaving
    if (TAB_ROOTS.includes(leaving)) {
      scrollPositions.current[leaving] = container.scrollTop;
    }

    // Restore scroll of the tab we're arriving at (0 if first visit)
    if (TAB_ROOTS.includes(arriving)) {
      const saved = scrollPositions.current[arriving] ?? 0;
      // Use requestAnimationFrame so the new content has rendered
      requestAnimationFrame(() => {
        if (containerRef.current) containerRef.current.scrollTop = saved;
      });
    }

    prevPath.current = arriving;
  }, [location.pathname]);

  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      {/* Scrollable content area — reserve bottom-nav space to prevent layout shift */}
      <div ref={containerRef} className="min-h-screen overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Reserve nav height so content never shifts when nav mounts */}
        <div style={{ paddingBottom: '64px' }}>
          <Outlet />
        </div>
      </div>
      <BottomNav scrollContainerRef={containerRef} />
    </div>
  );
}