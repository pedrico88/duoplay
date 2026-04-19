import React, { useEffect, useRef } from 'react';
import { useInterstitialAd } from '@/lib/useAdMob';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function WinnerModal({ show, winner, onPlayAgain, onExit, isDraw = false }) {
  const { showAd } = useInterstitialAd();
  const firedRef = useRef(false);

useEffect(() => {
  if (show) {
    if (!isDraw && !firedRef.current) {
      firedRef.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    showAd().catch((e) => console.warn('Ad error:', e));
  }
  if (!show) firedRef.current = false;
}, [show, isDraw]);

const handlePlayAgain = () => {
  onPlayAgain();
};

const handleExit = () => {
  onExit();
};
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="text-6xl mb-4">
              {isDraw ? '🤝' : '🏆'}
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {isDraw ? '¡Empate!' : '¡Victoria!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isDraw ? 'Nadie gana esta ronda' : `${winner} ha ganado`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExit} className="flex-1 rounded-xl">
                Salir
              </Button>
              <Button onClick={handlePlayAgain} className="flex-1 rounded-xl bg-primary">
                Jugar otra vez
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}