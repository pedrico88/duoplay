/**
 * NativeHeader — iOS/Android-style sticky top bar with back button.
 * Replaces ad-hoc header markup across pages.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NativeHeader({ title, subtitle, backTo, onBack, rightSlot }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backTo) { navigate(backTo); return; }
    navigate(-1);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 flex items-center gap-3 px-2 py-2 bg-card/80 backdrop-blur-xl border-b border-border safe-area-top"
      role="banner"
    >
      {/* Back button — always 44×44 */}
      <button
        onClick={handleBack}
        aria-label="Volver"
        className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted/60 active:bg-muted transition-colors flex-shrink-0"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-base leading-tight truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight truncate">{subtitle}</p>
        )}
      </div>

      {/* Optional right slot (reset button, etc.) */}
      <div className="flex-shrink-0 w-11 flex items-center justify-center">
        {rightSlot || null}
      </div>
    </motion.header>
  );
}