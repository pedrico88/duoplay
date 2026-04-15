/**
 * PullToRefresh — works with sticky headers and overflow:visible containers.
 *
 * Instead of reading scrollTop from its own container (which breaks when the
 * scroll root is a parent), it listens to the window scroll position.
 * Content is shifted via CSS translate only — no scrollTop mutation.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  // Use window scroll to detect "at top" — works regardless of scroll container depth
  const isAtTop = () => window.scrollY === 0;

  const onTouchStart = useCallback((e) => {
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    if (!isAtTop()) { startY.current = null; return; }

    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      pulling.current = true;
      // Prevent the browser's native overscroll from fighting us
      e.preventDefault();
      setPullDistance(Math.min(THRESHOLD * 1.5, delta * 0.45));
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, onRefresh]);

  // Register touch listeners with { passive: false } so we can call preventDefault
  const wrapperRef = useRef(null);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const indicatorHeight = refreshing ? THRESHOLD : pullDistance;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Pull indicator — sits above the content, does NOT shift the sticky header */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none overflow-hidden"
            style={{ height: indicatorHeight }}
          >
            <div className="flex items-end justify-center pb-2">
              <div className="w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center">
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: progress * 360 }}
                  transition={refreshing
                    ? { repeat: Infinity, duration: 0.7, ease: 'linear' }
                    : { duration: 0 }}
                >
                  <RefreshCw
                    className="w-4 h-4 text-primary"
                    style={{ opacity: 0.4 + progress * 0.6 }}
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content — translate only, never touch scrollTop */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
          willChange: pullDistance > 0 ? 'transform' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}