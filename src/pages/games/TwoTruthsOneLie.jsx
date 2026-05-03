import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';

export default function TwoTruthsOneLie() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup'); // setup, write, guess, result
  const [player, setPlayer] = useState(1); // who is writing
  const [statements, setStatements] = useState(['', '', '']);
  const [lieIdx, setLieIdx] = useState(null);
  const [guesserChoice, setGuesserChoice] = useState(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const ROUNDS = 4;
  const [shuffleOrder, setShuffleOrder] = useState([0, 1, 2]);

  const startWriting = () => {
    setStatements(['', '', '']);
    setLieIdx(null);
    setGuesserChoice(null);
    setShuffleOrder([0, 1, 2].sort(() => Math.random() - 0.5));
    setPhase('write');
  };

  const canSubmit = statements.every(s => s.trim().length > 3) && lieIdx !== null;

  const submitStatements = () => setPhase('guess');

  const makeGuess = (idx) => {
    setGuesserChoice(idx);
    setPhase('result');
    // guesser wins if they find the lie
    const guesser = player === 1 ? 2 : 1;
    if (idx === lieIdx) {
      const key = `p${guesser}`;
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    } else {
      const key = `p${player}`;
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const next = () => {
    if (round >= ROUNDS) { navigate('/games'); return; }
    setRound(r => r + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    setPhase('setup');
  };

  const writer = `Jugador ${player}`;
  const guesser = `Jugador ${player === 1 ? 2 : 1}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
      <NativeHeader title="2 Verdades 1 Mentira" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">🤥</div>
              <h2 className="font-display text-2xl font-bold">2 Verdades 1 Mentira</h2>
              <p className="text-muted-foreground text-sm">
                <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>{writer}</span> escribe 2 verdades y 1 mentira. El otro adivina cuál es la mentira.
              </p>
              <Button onClick={startWriting} className="rounded-2xl px-8 font-display text-lg">Empezar →</Button>
            </motion.div>
          )}

          {phase === 'write' && (
            <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 w-full">
              <p className="text-sm text-center text-muted-foreground">
                <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>{writer}</span> — escribe tus 3 afirmaciones y marca cuál es la mentira
              </p>
              {statements.map((s, i) => (
                <div key={i} className={`flex gap-2 items-center p-3 rounded-2xl border-2 transition-all ${lieIdx === i ? 'border-destructive bg-destructive/5' : 'border-border bg-card'}`}>
                  <button onClick={() => setLieIdx(lieIdx === i ? null : i)}
                    className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${lieIdx === i ? 'border-destructive bg-destructive text-white' : 'border-border'}`}>
                    {lieIdx === i ? '🤥' : i + 1}
                  </button>
                  <input
                    className="flex-1 bg-transparent font-body text-base outline-none"
                    placeholder={`Afirmación ${i + 1}…`}
                    value={s}
                    onChange={e => { const arr = [...statements]; arr[i] = e.target.value; setStatements(arr); }}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center">Toca el número para marcar la mentira</p>
              <Button disabled={!canSubmit} onClick={submitStatements} className="rounded-2xl font-display">Listo — que adivine {guesser} →</Button>
            </motion.div>
          )}

          {phase === 'guess' && (
            <motion.div key="guess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 w-full">
              <p className="text-sm text-center">
                <span className={`font-bold ${player === 1 ? 'text-secondary' : 'text-primary'}`}>{guesser}</span> — ¿cuál es la mentira?
              </p>
              {shuffleOrder.map((origIdx) => (
                <button key={origIdx} onClick={() => makeGuess(origIdx)}
                  className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary active:scale-[0.97] transition-all text-left font-medium">
                  {statements[origIdx]}
                </button>
              ))}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className="text-6xl">{guesserChoice === lieIdx ? '🎉' : '😈'}</div>
              <p className="font-display text-2xl font-bold text-center">
                {guesserChoice === lieIdx ? `¡${guesser} adivinó!` : `¡${writer} engañó!`}
              </p>
              <div className="w-full space-y-2">
                {statements.map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border-2 ${i === lieIdx ? 'border-destructive bg-destructive/10' : 'border-green-400 bg-green-500/10'}`}>
                    <span className="text-xs font-bold mr-2">{i === lieIdx ? '🤥 MENTIRA' : '✅ VERDAD'}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <Button onClick={next} className="rounded-2xl px-8">{round >= ROUNDS ? 'Fin' : 'Siguiente →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}