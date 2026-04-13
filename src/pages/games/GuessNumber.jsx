import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/lib/gameContext.jsx';

const MAX_ATTEMPTS = 7;

export default function GuessNumber() {
  const navigate = useNavigate();
  const { recordWin } = useGame();
  const [phase, setPhase] = useState('setup'); // setup | guessing | result
  const [secret, setSecret] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [scores, setScores] = useState({ p1: 0, p2: 0 }); // p1 = setter, p2 = guesser
  const [round, setRound] = useState(1);
  const [setter, setSetter] = useState(0); // 0 or 1 (player index)
  const [winner, setWinner] = useState(null);

  const PLAYERS = ['Jugador 1', 'Jugador 2'];
  const guesser = setter === 0 ? 1 : 0;

  const confirmSecret = () => {
    const n = parseInt(secretInput);
    if (isNaN(n) || n < range.min || n > range.max) return;
    setSecret(n);
    setSecretInput('');
    setAttempts([]);
    setPhase('guessing');
  };

  const makeGuess = () => {
    const n = parseInt(guess);
    if (isNaN(n) || n < range.min || n > range.max) return;

    const hint = n === secret ? 'correct' : n < secret ? 'higher' : 'lower';
    const newAttempts = [...attempts, { value: n, hint }];
    setAttempts(newAttempts);
    setGuess('');

    if (hint === 'correct') {
      const attemptsUsed = newAttempts.length;
      const pointsForGuesser = Math.max(1, MAX_ATTEMPTS - attemptsUsed + 1);
      const newScores = { ...scores };
      newScores[guesser === 0 ? 'p1' : 'p2'] += pointsForGuesser;
      setScores(newScores);

      if (round >= 4) {
        // End game after 4 rounds (each player sets twice)
        const finalWinner = newScores.p1 > newScores.p2 ? PLAYERS[0] : newScores.p2 > newScores.p1 ? PLAYERS[1] : null;
        setWinner(finalWinner || 'Empate');
        recordWin('guessnumber', finalWinner ? (guesser === 0 ? 'player1' : 'player2') : null);
        setPhase('result');
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          setSetter(s => s === 0 ? 1 : 0);
          setAttempts([]);
          setSecret('');
          setPhase('setup');
        }, 1500);
      }
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      // Out of attempts, setter wins this round
      const newScores = { ...scores };
      newScores[setter === 0 ? 'p1' : 'p2'] += 3;
      setScores(newScores);
      setTimeout(() => {
        if (round >= 4) {
          const finalWinner = newScores.p1 > newScores.p2 ? PLAYERS[0] : newScores.p2 > newScores.p1 ? PLAYERS[1] : null;
          setWinner(finalWinner || 'Empate');
          setPhase('result');
        } else {
          setRound(r => r + 1);
          setSetter(s => s === 0 ? 1 : 0);
          setAttempts([]);
          setSecret('');
          setPhase('setup');
        }
      }, 1500);
    }
  };

  const restart = () => {
    setPhase('setup');
    setSecret('');
    setAttempts([]);
    setScores({ p1: 0, p2: 0 });
    setRound(1);
    setSetter(0);
    setWinner(null);
  };

  const hintColor = (hint) => hint === 'correct' ? 'bg-green-500' : hint === 'higher' ? 'bg-blue-500' : 'bg-orange-500';
  const hintIcon = (hint) => hint === 'correct' ? '✅' : hint === 'higher' ? '⬆️' : '⬇️';
  const hintText = (hint) => hint === 'correct' ? '¡Correcto!' : hint === 'higher' ? 'Más alto' : 'Más bajo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{PLAYERS[0]}: {scores.p1}pts</span>
          <span className="text-xl">🔢</span>
          <span className="text-sm font-bold text-secondary">{PLAYERS[1]}: {scores.p2}pts</span>
        </div>
        <div className="text-xs text-muted-foreground">R{round}/4</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <AnimatePresence mode="wait">

          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm text-center"
            >
              <div className="text-5xl mb-4">🤫</div>
              <h2 className="font-display text-2xl font-bold mb-1">{PLAYERS[setter]}</h2>
              <p className="text-muted-foreground mb-6">Elige un número secreto entre {range.min} y {range.max}</p>
              <p className="text-xs text-muted-foreground mb-4">¡Que el otro jugador no vea la pantalla!</p>
              <div className="flex gap-2 mb-4">
                <Input
                  type="number"
                  value={secretInput}
                  onChange={e => setSecretInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmSecret()}
                  placeholder={`${range.min} - ${range.max}`}
                  className="text-center text-lg h-12 rounded-xl"
                  min={range.min}
                  max={range.max}
                />
                <Button onClick={confirmSecret} className="h-12 px-6 rounded-xl bg-primary">
                  ✓
                </Button>
              </div>
              <div className="flex gap-2 justify-center text-sm text-muted-foreground">
                <span>Rango:</span>
                {[{ min: 1, max: 50 }, { min: 1, max: 100 }, { min: 1, max: 200 }].map(r => (
                  <button
                    key={r.max}
                    onClick={() => setRange(r)}
                    className={`px-2 py-0.5 rounded-full border transition-colors ${range.max === r.max ? 'border-primary text-primary' : 'border-border'}`}
                  >
                    {r.min}-{r.max}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'guessing' && (
            <motion.div
              key="guessing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <p className="text-muted-foreground text-sm">Adivina el número de {PLAYERS[setter]}</p>
                <h2 className="font-display text-2xl font-bold text-secondary">{PLAYERS[guesser]}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {range.min}–{range.max} · {MAX_ATTEMPTS - attempts.length} intentos restantes
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  type="number"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && makeGuess()}
                  placeholder="Tu número..."
                  className="text-center text-lg h-12 rounded-xl"
                  min={range.min}
                  max={range.max}
                />
                <Button onClick={makeGuess} className="h-12 px-6 rounded-xl bg-secondary">
                  →
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {attempts.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold ${hintColor(a.hint)}`}
                  >
                    {a.value} {hintIcon(a.hint)} <span className="text-xs font-normal opacity-90">{hintText(a.hint)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm text-center"
            >
              <div className="text-6xl mb-4">{winner === 'Empate' ? '🤝' : '🏆'}</div>
              <h2 className="font-display text-3xl font-bold mb-2">{winner === 'Empate' ? '¡Empate!' : '¡Ganador!'}</h2>
              {winner !== 'Empate' && <p className="text-xl font-bold text-primary mb-1">{winner}</p>}
              <div className="flex gap-4 justify-center mt-4 mb-8">
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <p className="text-2xl font-bold text-primary">{scores.p1}</p>
                  <p className="text-xs text-muted-foreground">{PLAYERS[0]}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <p className="text-2xl font-bold text-secondary">{scores.p2}</p>
                  <p className="text-xs text-muted-foreground">{PLAYERS[1]}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/games')} className="flex-1 rounded-xl">Salir</Button>
                <Button onClick={restart} className="flex-1 rounded-xl bg-primary">Otra partida</Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}