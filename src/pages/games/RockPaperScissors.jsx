import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';

const CLASSIC = [
  { id: 'rock', emoji: '✊', name: 'Piedra' },
  { id: 'paper', emoji: '✋', name: 'Papel' },
  { id: 'scissors', emoji: '✌️', name: 'Tijera' },
];

const SPOCK = [
  ...CLASSIC,
  { id: 'lizard', emoji: '🦎', name: 'Lagarto' },
  { id: 'spock', emoji: '🖖', name: 'Spock' },
];

const WINS_CLASSIC = { rock: ['scissors'], paper: ['rock'], scissors: ['paper'] };
const WINS_SPOCK = {
  rock: ['scissors', 'lizard'], paper: ['rock', 'spock'], scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'], spock: ['rock', 'scissors']
};

export default function RockPaperScissors() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [bestOf, setBestOf] = useState(null);
  const [variant, setVariant] = useState(null);
  const [phase, setPhase] = useState('setup'); // setup, p1pick, p2pick, countdown, reveal
  const [p1Choice, setP1Choice] = useState(null);
  const [p2Choice, setP2Choice] = useState(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef(null);

  const choices = variant === 'spock' ? SPOCK : CLASSIC;
  const winsMap = variant === 'spock' ? WINS_SPOCK : WINS_CLASSIC;
  const neededWins = bestOf ? Math.ceil(bestOf / 2) : 3;

  const startGame = (bo, v) => {
    setBestOf(bo);
    setVariant(v);
    setPhase('p1pick');
  };

  const handleP1Pick = (choice) => {
    setP1Choice(choice);
    setPhase('p2pick');
  };

  const handleP2Pick = (choice) => {
    setP2Choice(choice);
    setPhase('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('reveal');
      resolveRound();
      return;
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 700);
    return () => clearTimeout(timerRef.current);
  }, [phase, countdown]);

  const resolveRound = () => {
    if (!p1Choice || !p2Choice) return;
    let result;
    if (p1Choice.id === p2Choice.id) result = 'draw';
    else if (winsMap[p1Choice.id]?.includes(p2Choice.id)) result = 'p1';
    else result = 'p2';

    setRoundResult(result);
    setHistory(h => [...h, { p1: p1Choice, p2: p2Choice, result }]);

    if (result !== 'draw') {
      const newScores = { ...scores };
      newScores[result]++;
      setScores(newScores);

      if (newScores[result] >= neededWins) {
        setTimeout(() => {
          setShowWinner(true);
          if (result === 'p1') {
            recordWin('rps');
            setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
          } else {
            recordLoss('rps');
            setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
          }
        }, 1500);
      }
    }
  };

  const nextRound = () => {
    setP1Choice(null);
    setP2Choice(null);
    setRoundResult(null);
    setPhase('p1pick');
  };

  const resetAll = () => {
    setScores({ p1: 0, p2: 0 });
    setHistory([]);
    setShowWinner(false);
    nextRound();
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader emoji="✊✋✌️" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Piedra, Papel, Tijera</h2>
          <div className="space-y-4 w-full max-w-xs">
            <p className="text-sm text-muted-foreground text-center">Al mejor de:</p>
            <div className="flex gap-3 justify-center">
              {[5, 7, 11].map(n => (
                <Button key={n} variant="outline" onClick={() => startGame(n, 'classic')}
                  className="h-16 w-20 rounded-2xl font-display text-lg flex flex-col">
                  <span className="text-2xl font-bold">{n}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">Variante Spock:</p>
            <div className="flex gap-3 justify-center">
              {[5, 7, 11].map(n => (
                <Button key={`s${n}`} variant="outline" onClick={() => startGame(n, 'spock')}
                  className="h-16 w-20 rounded-2xl font-display text-lg flex flex-col border-secondary text-secondary">
                  <span className="text-2xl font-bold">{n}</span>
                  <span className="text-[9px]">🖖</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="✊✋✌️"
        onReset={resetAll}
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {phase === 'p1pick' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-lg font-display font-bold text-primary mb-2">Jugador 1</p>
            <p className="text-sm text-muted-foreground mb-4">Elige tu jugada (no mires, J2!)</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {choices.map(c => (
                <button key={c.id} onClick={() => handleP1Pick(c)}
                  className="w-20 h-20 rounded-2xl bg-card border-2 border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-all active:scale-90">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'p2pick' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-lg font-display font-bold text-secondary mb-2">Jugador 2</p>
            <p className="text-sm text-muted-foreground mb-4">Elige tu jugada</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {choices.map(c => (
                <button key={c.id} onClick={() => handleP2Pick(c)}
                  className="w-20 h-20 rounded-2xl bg-card border-2 border-border hover:border-secondary flex flex-col items-center justify-center gap-1 transition-all active:scale-90">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'countdown' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className="text-8xl font-display font-bold text-primary">{countdown || '🔥'}</div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="text-6xl">{p1Choice?.emoji}</motion.div>
                <p className="text-sm font-medium mt-2">J1</p>
              </div>
              <span className="text-2xl font-display text-muted-foreground">VS</span>
              <div className="text-center">
                <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="text-6xl">{p2Choice?.emoji}</motion.div>
                <p className="text-sm font-medium mt-2">J2</p>
              </div>
            </div>
            <div className={`text-lg font-display font-bold ${
              roundResult === 'p1' ? 'text-primary' : roundResult === 'p2' ? 'text-secondary' : 'text-muted-foreground'
            }`}>
              {roundResult === 'p1' ? '¡J1 gana la ronda!' : roundResult === 'p2' ? '¡J2 gana la ronda!' : '¡Empate!'}
            </div>
            {!showWinner && (
              <Button onClick={nextRound} className="rounded-xl">Siguiente ronda</Button>
            )}
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && phase !== 'countdown' && (
          <div className="w-full max-w-xs mt-4">
            <p className="text-xs text-muted-foreground mb-2">Historial:</p>
            <div className="flex flex-wrap gap-1">
              {history.map((h, i) => (
                <div key={i} className={`text-xs px-2 py-1 rounded-full ${
                  h.result === 'p1' ? 'bg-primary/10 text-primary' : h.result === 'p2' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  {h.p1.emoji} vs {h.p2.emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 >= neededWins ? 'Jugador 1' : 'Jugador 2'}
        onPlayAgain={() => { setShowWinner(false); resetAll(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}