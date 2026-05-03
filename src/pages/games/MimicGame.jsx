import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  { cat: '🎬 Películas', items: ['Titanic','Avatar','Shrek','Toy Story','Matrix','El Rey León','Frozen','Spider-Man'] },
  { cat: '👤 Famosos', items: ['Einstein','Shakira','Messi','Obama','Beyoncé','Picasso','Cleopatra','Tesla'] },
  { cat: '🐾 Animales', items: ['Pingüino','Koala','Cocodrilo','Flamenco','Camaleón','Mantis religiosa','Oso panda','Ornitorrinco'] },
  { cat: '💼 Profesiones', items: ['Bombero','Cirujano','Dj','Árbitro','Astronauta','Submarinista','Mago','Domador de leones'] },
  { cat: '🎭 Situaciones', items: ['Ducharse en frío','Bailar en metro','Atrapado en ascensor','Comer sopa caliente','Pasear un perro grande','Intentar abrir un jar','Surfear','Hacer yoga'] },
];

const TIME = 45;

export default function MimicGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup');
  const [catIdx, setCatIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [itemIdx, setItemIdx] = useState(0);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [player, setPlayer] = useState(1);
  const [showing, setShowing] = useState(false);
  const timerRef = useRef(null);
  const ROUNDS = 6;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const startRound = (ci) => {
    const cat = CARDS[ci];
    const shuffled = shuffle(cat.items);
    setItems(shuffled);
    setItemIdx(0);
    setTimeLeft(TIME);
    setPhase('mimic');
    setShowing(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase('score'); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const correct = () => {
    const key = `p${player}`;
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    setItemIdx(i => i + 1);
  };

  const skip = () => setItemIdx(i => i + 1);

  const endRound = () => {
    clearInterval(timerRef.current);
    if (round >= ROUNDS) { navigate('/games'); return; }
    setRound(r => r + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    setPhase('setup');
    setShowing(false);
  };

  const currentItem = items[itemIdx] || null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-500/10 to-orange-500/10">
      <NativeHeader title="Mímica" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className="text-6xl">🎭</div>
              <p className="text-sm text-muted-foreground text-center">
                <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span> hace la mímica
              </p>
              <p className="font-display text-lg font-bold text-center">Elige una categoría:</p>
              <div className="grid grid-cols-1 gap-3 w-full">
                {CARDS.map((c, i) => (
                  <button key={i} onClick={() => { setCatIdx(i); startRound(i); }}
                    className="p-4 rounded-2xl border-2 border-border bg-card hover:border-primary active:scale-95 transition-all font-display font-bold text-left">
                    {c.cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'mimic' && (
            <motion.div key="mimic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl font-bold border-4 ${timeLeft <= 10 ? 'border-destructive text-destructive animate-pulse' : 'border-primary text-primary'}`}>
                {timeLeft}
              </div>
              <p className="text-xs text-muted-foreground">Solo mira tú — el otro no</p>
              {currentItem ? (
                <motion.div key={itemIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-3xl border-2 border-primary p-8 w-full text-center shadow-lg">
                  <p className="font-display text-3xl font-bold">{currentItem}</p>
                </motion.div>
              ) : (
                <div className="bg-muted rounded-3xl p-8 text-center w-full">
                  <p className="font-display text-2xl">¡Sin más palabras!</p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={skip} className="flex-1 rounded-2xl text-base">⏭ Pasar</Button>
                <Button onClick={correct} className="flex-1 rounded-2xl text-base bg-green-500 hover:bg-green-600">✅ Correcto</Button>
              </div>
            </motion.div>
          )}

          {phase === 'score' && (
            <motion.div key="score" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-6xl">🎉</div>
              <p className="font-display text-2xl font-bold">Fin del turno</p>
              <div className="flex gap-8">
                <div className="text-center"><p className="text-xs text-muted-foreground">J1</p><p className="font-display text-3xl font-bold text-primary">{scores.p1}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">J2</p><p className="font-display text-3xl font-bold text-secondary">{scores.p2}</p></div>
              </div>
              <Button onClick={endRound} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado final' : 'Siguiente turno →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}