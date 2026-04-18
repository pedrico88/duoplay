import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { TRUTHS, DARES } from '@/lib/truthOrDareData';

const PLAYERS = ['Jugador 1', 'Jugador 2'];

export default function TruthOrDare() {
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [card, setCard] = useState(null);
  const [type, setType] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [usedTruths] = useState(new Set());
  const [usedDares] = useState(new Set());

  const pick = (t) => {
    const list = t === 'truth' ? TRUTHS : DARES;
    const used = t === 'truth' ? usedTruths : usedDares;
    const available = list.filter((_, i) => !used.has(i));
    const pool = available.length > 0 ? available : list;
    const idx = Math.floor(Math.random() * pool.length);
    const actualIdx = available.length > 0 ? list.indexOf(pool[idx]) : idx;
    used.add(actualIdx);
    setType(t);
    setCard(pool[idx]);
    setRevealed(true);
  };

  const next = () => {
    setRevealed(false);
    setCard(null);
    setType(null);
    setCurrentPlayer((p) => (p + 1) % 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex flex-col">
      <NativeHeader title="Verdad o Reto" subtitle="🎯🔥" backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Current player */}
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm">Le toca a</p>
          <h2 className="font-display text-3xl font-bold text-primary">{PLAYERS[currentPlayer]}</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs flex flex-col gap-4"
            >
              <Button
                onClick={() => pick('truth')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-lg"
              >
                🤔 Verdad
              </Button>
              <Button
                onClick={() => pick('dare')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg"
              >
                🔥 Reto
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              className="w-full max-w-sm"
            >
              <div className={`rounded-3xl p-8 text-center shadow-2xl ${type === 'truth' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-orange-500 to-red-500'} text-white`}>
                <p className="text-4xl mb-4">{type === 'truth' ? '🤔' : '🔥'}</p>
                <p className="text-sm font-medium opacity-80 mb-3 uppercase tracking-widest">
                  {type === 'truth' ? 'Verdad' : 'Reto'}
                </p>
                <p className="text-xl font-bold leading-relaxed">{card}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => pick(type)} className="flex-1 rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4" /> Otra
                </Button>
                <Button onClick={next} className="flex-1 rounded-xl bg-primary">
                  Siguiente turno →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}