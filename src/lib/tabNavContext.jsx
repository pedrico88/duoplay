/**
 * TabNavContext — maintains per-tab navigation history stacks.
 *
 * Each bottom-nav tab owns its own history stack. Switching to a tab
 * restores where the user was inside that tab. Re-selecting the active
 * tab pops back to the tab root (stack reset).
 *
 * The BottomNav component is the only consumer; all other components
 * continue to use react-router-dom normally.
 */
import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TAB_ROOTS = ['/', '/games', '/scores', '/profile', '/settings'];

const TabNavContext = createContext(null);

export function TabNavProvider({ children }) {
  // Map<tabRoot, currentPath> — last visited path inside each tab
  const stackRef = useRef(
    Object.fromEntries(TAB_ROOTS.map(r => [r, r]))
  );

  // Update the remembered path for the tab that owns `pathname`
  const recordVisit = useCallback((pathname) => {
    const root = TAB_ROOTS.find(r => pathname === r || (r !== '/' && pathname.startsWith(r)));
    if (root) stackRef.current[root] = pathname;
  }, []);

  // Return remembered path for a tab, falling back to root
  const getStack = useCallback((root) => stackRef.current[root] ?? root, []);

  return (
    <TabNavContext.Provider value={{ recordVisit, getStack }}>
      {children}
    </TabNavContext.Provider>
  );
}

export function useTabNav() {
  const ctx = useContext(TabNavContext);
  if (!ctx) throw new Error('useTabNav must be used inside TabNavProvider');
  return ctx;
}

/**
 * Convenience hook used by BottomNav to handle a tab press.
 * Returns a stable `handleTabPress(tabRoot)` function.
 */
export function useTabPress(scrollContainerRef) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getStack } = useTabNav();

  return useCallback((tabRoot) => {
    const isActiveTab = location.pathname === tabRoot ||
      (tabRoot !== '/' && location.pathname.startsWith(tabRoot));

    if (isActiveTab) {
      // Re-tap active tab: go to root of that tab
      if (location.pathname !== tabRoot) {
        navigate(tabRoot, { replace: true });
      } else {
        // Already at root — scroll to top
        scrollContainerRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Navigate to last remembered position inside the target tab
      const dest = getStack(tabRoot);
      navigate(dest);
    }
  }, [location.pathname, navigate, getStack, scrollContainerRef]);
}