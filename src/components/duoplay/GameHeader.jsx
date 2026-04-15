import React, { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExitGameDrawer from './ExitGameDrawer';

export default function GameHeader({ title, emoji, onReset, player1Score = 0, player2Score = 0, player1Name = 'J1', player2Name = 'J2' }) {
  const navigate = useNavigate();
  const [showExit, setShowExit] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-2 py-2 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 safe-area-top"
        role="banner"
      >
        {/* Back — 44×44 tap target */}
        <button
          onClick={() => setShowExit(true)}
          aria-label="Salir del juego"
          className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted/60 active:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Score display */}
        <div className="flex items-center gap-3" aria-label="Marcador">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-primary">{player1Name}</span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center" aria-label={`${player1Name}: ${player1Score}`}>
              {player1Score}
            </span>
          </div>
          <span className="text-lg" aria-hidden="true">{emoji}</span>
          <div className="flex items-center gap-1.5">
            <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center" aria-label={`${player2Name}: ${player2Score}`}>
              {player2Score}
            </span>
            <span className="text-sm font-bold text-secondary">{player2Name}</span>
          </div>
        </div>

        {/* Reset — 44×44 tap target */}
        {onReset ? (
          <button
            onClick={onReset}
            aria-label="Reiniciar partida"
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted/60 active:bg-muted transition-colors"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <div className="w-11" aria-hidden="true" />
        )}
      </motion.div>

      <ExitGameDrawer
        open={showExit}
        onOpenChange={setShowExit}
        onConfirm={() => { setShowExit(false); navigate('/games'); }}
      />
    </>
  );
}