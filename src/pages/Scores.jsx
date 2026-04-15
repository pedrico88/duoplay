import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function Scores() {
  const { sessionScore, setSessionScore } = useGame();

  // Optimistic update helpers — state is local so updates are instant
  const adjustScore = useCallback((player, delta) => {
    setSessionScore(prev => ({
      ...prev,
      [player]: Math.max(0, prev[player] + delta),
    }));
  }, [setSessionScore]);

  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="max-w-lg mx-auto pt-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-2xl font-bold mb-6"
        >
          🏆 Marcador de Sesión
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-8 text-center mb-6"
        >
          <p className="text-sm text-muted-foreground mb-6">¿Quién va ganando hoy?</p>

          <div className="flex items-center justify-center gap-8" role="group" aria-label="Marcador de sesión">
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={sessionScore.player1}
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-5xl font-display font-bold text-primary tabular-nums"
                  aria-live="polite"
                  aria-label={`Jugador 1: ${sessionScore.player1} puntos`}
                >
                  {sessionScore.player1}
                </motion.div>
              </AnimatePresence>
              <p className="text-sm font-medium mt-2">Jugador 1</p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  className="rounded-full h-11 w-11 p-0 text-xl leading-none"
                  aria-label="Restar punto Jugador 1"
                  onClick={() => adjustScore('player1', -1)}
                >
                  −
                </Button>
                <Button
                  className="rounded-full h-11 w-11 p-0 text-xl leading-none"
                  aria-label="Sumar punto Jugador 1"
                  onClick={() => adjustScore('player1', 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="text-3xl font-display text-muted-foreground select-none">VS</div>

            {/* Player 2 */}
            <div className="flex flex-col items-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={sessionScore.player2}
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-5xl font-display font-bold text-secondary tabular-nums"
                  aria-live="polite"
                  aria-label={`Jugador 2: ${sessionScore.player2} puntos`}
                >
                  {sessionScore.player2}
                </motion.div>
              </AnimatePresence>
              <p className="text-sm font-medium mt-2">Jugador 2</p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  className="rounded-full h-11 w-11 p-0 text-xl leading-none"
                  aria-label="Restar punto Jugador 2"
                  onClick={() => adjustScore('player2', -1)}
                >
                  −
                </Button>
                <Button
                  className="rounded-full h-11 w-11 p-0 text-xl leading-none"
                  aria-label="Sumar punto Jugador 2"
                  onClick={() => adjustScore('player2', 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {sessionScore.player1 > sessionScore.player2 && (
              <p className="text-primary font-display font-bold">🎉 ¡Jugador 1 va ganando!</p>
            )}
            {sessionScore.player2 > sessionScore.player1 && (
              <p className="text-secondary font-display font-bold">🎉 ¡Jugador 2 va ganando!</p>
            )}
            {sessionScore.player1 === sessionScore.player2 && (
              <p className="text-muted-foreground font-display">🤝 Empate</p>
            )}
          </div>
        </motion.div>

        <Button
          variant="outline"
          className="w-full rounded-xl h-12 gap-2"
          aria-label="Reiniciar marcador"
          onClick={() => setSessionScore({ player1: 0, player2: 0 })}
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar marcador
        </Button>
      </div>
    </div>
  );
}