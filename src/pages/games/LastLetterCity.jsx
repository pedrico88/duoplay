import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Classic game: name a city starting with the last letter of the previous city
const STARTERS = ['Madrid','Tokyo','Oslo','Amsterdam','Lima','Detroit','Istanbul','London','Nairobi','Dublin'];
const TIME_LIMIT = 12;

export default function LastLetterCity() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [cities, setCities] = useState([]);
  const [input, setInput] = useState('');
  const [player, setPlayer] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [error, setError] = useState('');
  const [lives, setLives] = useState({ p1: 3, p2: 3 });
  const [phase, setPhase] = useState('setup');
  const [showWinner, setShowWinner] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const last = cities.length > 0 ? cities[cities.length - 1] : null;

  const startGame = () => {
    const starter = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setCities([starter]);
    setPlayer(1); setLives({ p1: 3, p2: 3 });
    setTimeLeft(TIME_LIMIT); setInput(''); setError('');
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, cities]);

  const handleTimeout = () => {
    const key = player === 1 ? 'p1' : 'p2';
    const newLives = { ...lives, [key]: lives[key] - 1 };
    setLives(newLives);
    if (newLives[key] <= 0) { endGame(player === 1 ? 2 : 1); return; }
    setError(`⏰ ¡Tiempo! Jugador ${player} pierde una vida`);
    setPlayer(p => p === 1 ? 2 : 1);
    setTimeLeft(TIME_LIMIT); setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submit = () => {
    const city = input.trim();
    if (!city) return;
    const lastCity = last.toLowerCase();
    const lastChar = lastCity[lastCity.length - 1];
    if (city.toLowerCase()[0] !== lastChar) {
      setError(`❌ "${city}" debe empezar por "${lastChar.toUpperCase()}"`);
      return;
    }
    if (cities.map(c => c.toLowerCase()).includes(city.toLowerCase())) {
      setError(`❌ "${city}" ya fue usada`);
      return;
    }
    clearInterval(timerRef.current);
    setCities(prev => [...prev, city]);
    setPlayer(p => p === 1 ? 2 : 1);
    setTimeLeft(TIME_LIMIT); setInput(''); setError('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const endGame = (winner) => {
    setPhase('finished');
    const newScores = winner === 1 ? { p1: 1, p2: 0 } : { p1: 0, p2: 1 };
    setScores(newScores);
    if (winner === 1) { recordWin('lastlettercity'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
    else { recordLoss('lastlettercity'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
    setShowWinner(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Ciudades del Mundo" backTo="/games" />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        {phase === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-6xl">🌍</div>
            <h2 className="font-display text-2xl font-bold text-center">Ciudades del Mundo</h2>
            <p className="text-muted-foreground text-sm text-center">Di una ciudad que empiece por la última letra de la ciudad anterior. ¡{TIME_LIMIT}s por turno!</p>
            <Button onClick={startGame} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-1">{'❤️'.repeat(lives.p1)}{'🖤'.repeat(3 - lives.p1)}</div>
              <span className={`font-display text-lg font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              <div className="flex gap-1">{'❤️'.repeat(lives.p2)}{'🖤'.repeat(3 - lives.p2)}</div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className="text-sm text-center">Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span></p>
            <div className="bg-card rounded-2xl border border-border p-3 w-full max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {cities.map((c, i) => (
                  <span key={i} className={`px-2 py-1 rounded-lg text-sm font-medium ${i === cities.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c}</span>
                ))}
              </div>
            </div>
            {last && (
              <p className="text-center text-muted-foreground text-sm">
                La siguiente debe empezar por <span className="font-display text-2xl font-bold text-primary">{last[last.length - 1].toUpperCase()}</span>
              </p>
            )}
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <div className="flex gap-2 w-full">
              <input
                ref={inputRef}
                className="flex-1 p-4 rounded-2xl border-2 border-border bg-card font-display text-lg focus:border-primary outline-none"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Nombre de ciudad…"
              />
              <Button onClick={submit} disabled={!input.trim()} className="rounded-2xl px-5">OK</Button>
            </div>
          </>
        )}
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : 'Jugador 2'}
        isDraw={false}
        onPlayAgain={() => { setShowWinner(false); startGame(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}