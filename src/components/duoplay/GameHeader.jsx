import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function GameHeader({ title, emoji, onReset, player1Score = 0, player2Score = 0, player1Name = 'J1', player2Name = 'J2' }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 safe-area-top"
    >
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary">{player1Name}</span>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {player1Score}
          </span>
        </div>
        <span className="text-lg">{emoji}</span>
        <div className="flex items-center gap-1.5">
          <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {player2Score}
          </span>
          <span className="text-sm font-bold text-secondary">{player2Name}</span>
        </div>
      </div>

      {onReset && (
        <Button variant="ghost" size="icon" onClick={onReset} className="rounded-full">
          <RotateCcw className="w-5 h-5" />
        </Button>
      )}
      {!onReset && <div className="w-10" />}
    </motion.div>
  );
}