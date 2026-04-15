import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GAMES } from '@/lib/gameData';
import { useGame } from '@/lib/gameContext.jsx';
import { Trophy, ChevronRight, X } from 'lucide-react';
import NativeHeader from '@/components/duoplay/NativeHeader';

export default function Tournament() {
  const navigate = useNavigate();
  const { startTournament } = useGame();
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selected.length < 2) return;
    startTournament(selected);
    navigate(`/play/${selected[0]}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NativeHeader
        title="Modo Torneo"
        subtitle="Elige 2 o más juegos"
        backTo="/games"
        rightSlot={<Trophy className="w-5 h-5 text-accent" aria-hidden="true" />}
      />

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 pt-4 pb-3">
          <p className="text-muted-foreground text-sm">
            Elige <span className="font-semibold text-foreground">2 o más juegos</span>. Se jugarán en orden y el jugador con más victorias al final gana el torneo.
          </p>
        </div>

        {/* Game list */}
        <div className="px-4 flex flex-col gap-2">
          {GAMES.map((game, i) => {
            const isSelected = selected.includes(game.id);
            const order = selected.indexOf(game.id) + 1;
            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggle(game.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left w-full ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                {/* Order badge or empty circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {isSelected ? order : ''}
                </div>

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-xl flex-shrink-0`}>
                  {game.emoji.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-display font-bold text-sm ${isSelected ? 'text-primary' : ''}`}>{game.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{game.description}</p>
                </div>

                {isSelected && <X className="w-4 h-4 text-primary/60 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border">
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3"
            >
              <div className="flex gap-1.5 flex-wrap justify-center">
                {selected.map(id => {
                  const g = GAMES.find(x => x.id === id);
                  return (
                    <span key={id} className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${g.color} text-white font-medium`}>
                      {g.emoji.slice(0,2)} {g.name}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          onClick={handleStart}
          disabled={selected.length < 2}
          className="w-full h-14 rounded-2xl font-display font-bold text-lg bg-gradient-to-r from-accent to-primary hover:opacity-90 disabled:opacity-40 gap-2"
        >
          <Trophy className="w-5 h-5" />
          ¡Iniciar torneo! ({selected.length} juegos)
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}