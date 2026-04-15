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
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-1px_12px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-1 pt-1 pb-1 safe-area-bottom">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => handleTabPress(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl min-w-[56px] min-h-[56px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/12 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] font-semibold relative z-10 transition-colors leading-none ${
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