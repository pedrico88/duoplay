import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Gamepad2, User, Trophy, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTabPress, TAB_ROOTS } from '@/lib/tabNavContext.jsx';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/games', icon: Gamepad2, label: 'Juegos' },
  { path: '/scores', icon: Trophy, label: 'Marcador' },
  { path: '/profile', icon: User, label: 'Perfil' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

const BottomNav = memo(function BottomNav({ scrollContainerRef }) {
  const location = useLocation();
  const handleTabPress = useTabPress(scrollContainerRef);

  // Hide nav during active games or rooms
  if (location.pathname.startsWith('/play/')) return null;
  if (location.pathname.startsWith('/room/')) return null;
  if (location.pathname.startsWith('/tournament')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1 safe-area-bottom">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          // A tab is "active" if current path is the tab root or nested within it
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => handleTabPress(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default BottomNav;