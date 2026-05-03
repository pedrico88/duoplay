import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Sort items into the correct category as fast as possible
const CHALLENGES = [
  {
    categories: ['🐾 Animal', '🌿 Planta'],
    items: ['Perro','Rosa','Tigre','Cactus','Pez','Bambú','Loro','Tulipán','Oso','Hiedra','Delfín','Trigo'],
    answers: ['Animal','Planta','Animal','Planta','Animal','Planta','Animal','Planta','Animal','Planta','Animal','Planta'],
  },
  {
    categories: ['🌍 País', '🏙️ Ciudad'],
    items: ['París','España','Tokio','Brasil','Roma','Alemania','Berlín','China','Lyon','Perú','Osaka','México'],
    answers: ['Ciudad','País','Ciudad','País','Ciudad','País','Ciudad','País','Ciudad','País','Ciudad','País'],
  },
  {
    categories: ['⚽ Deporte', '🎵 Música'],
    items: ['Tenis','Jazz','Fútbol','Rock','Natación','Pop','Boxeo','Reggae','Golf','Salsa','Atletismo','Blues'],
    answers: ['Deporte','Música','Deporte','Música','Deporte','Música','Deporte','Música','Deporte','Música','Deporte','Música'],
  },
];

const TIME = 40;

export default function SpeedSort() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const timerRef = useRef(null);
  const ROUNDS = 4;

  const startRound = () => {
    const ci = Math.floor(Math.random() * CHALLENGES.length);
    setChallengeIdx(ci);
    setItemIdx(0);
    setCorrectCount(0);
    setTimeLeft(TIME);
    setLastCorrect(null);
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase('roundend'); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const pick = (catIdx) => {
    const ch = CHALLENGES[challengeIdx];
    const correctCat = ch.answers[itemIdx % ch.answers.length];
    const pickedCat = ch.categories[catIdx].replace(/^[^ ]+ /, '');
    const isCorrect = correctCat === pickedCat;
    setLastCorrect(isCorrect);
    if (isCorrect) setCorrectCount(c => c + 1);
    setItemIdx(i => i + 1);
  };

  const endRound = () => {
    clearInterval(timerRef.current);
    const key = `p${player}`;
    const added = correctCount;
    const newScores = { ...scores, [key]: scores[key] + added };
    setScores(newScores);
    if (round >= ROUNDS) {
      if (newScores.p1 > newScores.p2) { recordWin('speedsort'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (newScores.p2 > newScores.p1) { recordLoss('speedsort'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setShowWinner(true);
      return;
    }
    setRound(r => r + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    setPhase('setup');
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const ch = CHALLENGES[challengeIdx];
  const currentItem = ch ? ch.items[itemIdx % ch.items.length] : '';

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Ordena Rápido" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
              <div className="text-6xl">⚡</div>
              <h2 className="font-display text-2xl font-bold text-center">Ordena Rápido</h2>
              <p className="text-muted-foreground text-sm text-center">Clasifica los elementos en la categoría correcta lo más rápido posible. ¡{TIME}s!</p>
              <p className="text-sm">Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span></p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'playing' && ch && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold text-muted-foreground">✅ {correctCount}</span>
                <span className={`font-display text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
                <span className="text-sm font-bold text-muted-foreground">#{itemIdx + 1}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / TIME) * 100}%` }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={itemIdx} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className={`bg-card rounded-3xl border-2 p-8 w-full text-center shadow-md ${lastCorrect === true ? 'border-green-400' : lastCorrect === false ? 'border-destructive' : 'border-border'}`}>
                  <p className="font-display text-3xl font-bold">{currentItem}</p>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-4 w-full">
                {ch.categories.map((cat, i) => (
                  <button key={i} onClick={() => pick(i)}
                    className={`flex-1 h-20 rounded-2xl font-display font-bold text-base active:scale-95 transition-all ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'roundend' && (
            <motion.div key="roundend" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-6xl">🏁</div>
              <p className="font-display text-2xl font-bold text-center">Fin del turno</p>
              <p className="text-muted-foreground">Jugador {player}: <span className="font-bold text-foreground">{correctCount} correctas</span></p>
              <Button onClick={endRound} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado' : 'Siguiente →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); setPlayer(1); setPhase('setup'); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}