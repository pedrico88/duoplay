import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72; // px to pull before triggering

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const canPull = () => {
    const el = containerRef.current;
    return el ? el.scrollTop === 0 : true;
  };

  const onTouchStart = useCallback((e) => {
    if (canPull()) startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && canPull()) {
      // Rubber-band: resistance increases as you pull further
      setPullDistance(Math.min(THRESHOLD * 1.5, delta * 0.45));
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ minHeight: '100vh' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
            style={{ height: pullDistance || (refreshing ? THRESHOLD : 0) }}
          >
            <div className="flex items-end justify-center pb-2">
              <div
                className="w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: progress * 360 }}
                  transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : { duration: 0 }}
                >
                  <RefreshCw
                    className="w-4 h-4 text-primary"
                    style={{ opacity: 0.4 + progress * 0.6 }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content shifted down while pulling */}
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none' }}>
        {children}
      </div>
    </div>
  );
}