import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const CATEGORIES = [
  { id: 'ones', name: 'Unos', calc: (d) => d.filter(v => v === 1).length * 1 },
  { id: 'twos', name: 'Doses', calc: (d) => d.filter(v => v === 2).length * 2 },
  { id: 'threes', name: 'Treses', calc: (d) => d.filter(v => v === 3).length * 3 },
  { id: 'fours', name: 'Cuatros', calc: (d) => d.filter(v => v === 4).length * 4 },
  { id: 'fives', name: 'Cincos', calc: (d) => d.filter(v => v === 5).length * 5 },
  { id: 'sixes', name: 'Seises', calc: (d) => d.filter(v => v === 6).length * 6 },
  { id: 'threeofakind', name: 'Trío', calc: (d) => { const c = counts(d); return Object.values(c).some(v => v >= 3) ? d.reduce((a,b) => a+b, 0) : 0; }},
  { id: 'fourofakind', name: 'Póker', calc: (d) => { const c = counts(d); return Object.values(c).some(v => v >= 4) ? d.reduce((a,b) => a+b, 0) : 0; }},
  { id: 'fullhouse', name: 'Full', calc: (d) => { const c = counts(d); const vals = Object.values(c); return vals.includes(3) && vals.includes(2) ? 25 : 0; }},
  { id: 'smallstraight', name: 'Escalera corta', calc: (d) => { const s = [...new Set(d)].sort(); const str = s.join(''); return ['1234','2345','3456'].some(p => str.includes(p)) ? 30 : 0; }},
  { id: 'largestraight', name: 'Escalera larga', calc: (d) => { const s = [...new Set(d)].sort().join(''); return s === '12345' || s === '23456' ? 40 : 0; }},
  { id: 'yahtzee', name: 'Generala', calc: (d) => { const c = counts(d); return Object.values(c).some(v => v >= 5) ? 50 : 0; }},
  { id: 'chance', name: 'Chance', calc: (d) => d.reduce((a,b) => a+b, 0) },
];

function counts(dice) {
  const c = {};
  dice.forEach(d => { c[d] = (c[d] || 0) + 1; });
  return c;
}

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

export default function Dice() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [dice, setDice] = useState([1,1,1,1,1]);
  const [held, setHeld] = useState([false,false,false,false,false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [scoreCards, setScoreCards] = useState({ p1: {}, p2: {} });
  const [showWinner, setShowWinner] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const playerKey = currentPlayer === 1 ? 'p1' : 'p2';
  const turnsPlayed = Object.keys(scoreCards.p1).length + Object.keys(scoreCards.p2).length;
  const gameOver = turnsPlayed >= 26; // 13 categories × 2 players

  const handleRoll = () => {
    if (rollsLeft <= 0) return;
    setIsRolling(true);
    setTimeout(() => {
      setDice(prev => prev.map((d, i) => held[i] ? d : rollDice()));
      setRollsLeft(r => r - 1);
      setIsRolling(false);
    }, 300);
  };

  const toggleHold = (i) => {
    if (rollsLeft >= 3) return; // must roll first
    setHeld(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  };

  const scoreCategory = (catId) => {
    if (scoreCards[playerKey][catId] !== undefined) return;
    if (rollsLeft >= 3) return; // must roll first
    
    const cat = CATEGORIES.find(c => c.id === catId);
    const points = cat.calc(dice);
    
    setScoreCards(prev => ({
      ...prev,
      [playerKey]: { ...prev[playerKey], [catId]: points }
    }));

    // Next turn
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setDice([1,1,1,1,1]);
    setHeld([false,false,false,false,false]);
    setRollsLeft(3);

    // Check if game over
    const newTotal = Object.keys(scoreCards.p1).length + Object.keys(scoreCards.p2).length + 1;
    if (newTotal >= 26) {
      setTimeout(() => {
        setShowWinner(true);
        const p1Total = Object.values({ ...scoreCards.p1, ...(playerKey === 'p1' ? { [catId]: points } : {}) }).reduce((a,b) => a+b, 0);
        const p2Total = Object.values({ ...scoreCards.p2, ...(playerKey === 'p2' ? { [catId]: points } : {}) }).reduce((a,b) => a+b, 0);
        if (p1Total > p2Total) {
          recordWin('dice');
          setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
        } else {
          recordLoss('dice');
          setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
        }
      }, 500);
    }
  };

  const p1Total = Object.values(scoreCards.p1).reduce((a,b) => a+b, 0);
  const p2Total = Object.values(scoreCards.p2).reduce((a,b) => a+b, 0);

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🎲🎯"
        onReset={() => {
          setScoreCards({ p1: {}, p2: {} });
          setCurrentPlayer(1);
          setDice([1,1,1,1,1]);
          setHeld([false,false,false,false,false]);
          setRollsLeft(3);
          setShowWinner(false);
        }}
        player1Score={p1Total}
        player2Score={p2Total}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className={`text-center text-sm font-display font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>
          Turno de Jugador {currentPlayer} · {rollsLeft} tiradas restantes
        </div>

        {/* Dice */}
        <div className="flex items-center justify-center gap-3">
          {dice.map((d, i) => (
            <motion.button
              key={i}
              animate={isRolling && !held[i] ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => toggleHold(i)}
              className={`w-14 h-14 rounded-xl text-3xl flex items-center justify-center transition-all ${
                held[i] ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'bg-card border-2 border-border'
              }`}
            >
              {DICE_FACES[d - 1]}
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={handleRoll} disabled={rollsLeft <= 0 || isRolling} className="rounded-xl px-8">
            🎲 Tirar {rollsLeft < 3 && `(${rollsLeft})`}
          </Button>
          {rollsLeft < 3 && <p className="text-[10px] text-muted-foreground mt-1">Toca un dado para mantenerlo</p>}
        </div>

        {/* Score table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-4 gap-0 text-xs font-medium bg-muted px-3 py-2">
            <span>Categoría</span>
            <span className="text-center text-primary">J1</span>
            <span className="text-center text-secondary">J2</span>
            <span className="text-center">Puntos</span>
          </div>
          {CATEGORIES.map(cat => {
            const p1 = scoreCards.p1[cat.id];
            const p2 = scoreCards.p2[cat.id];
            const canScore = rollsLeft < 3 && scoreCards[playerKey][cat.id] === undefined;
            const preview = canScore ? cat.calc(dice) : null;
            
            return (
              <button
                key={cat.id}
                onClick={() => canScore && scoreCategory(cat.id)}
                disabled={!canScore}
                className={`grid grid-cols-4 gap-0 text-xs px-3 py-2 border-t border-border w-full transition-colors ${
                  canScore ? 'hover:bg-muted/50 cursor-pointer' : ''
                }`}
              >
                <span className="text-left font-medium">{cat.name}</span>
                <span className="text-center">{p1 !== undefined ? p1 : '-'}</span>
                <span className="text-center">{p2 !== undefined ? p2 : '-'}</span>
                <span className="text-center text-muted-foreground">
                  {canScore && <span className="text-primary font-bold">+{preview}</span>}
                </span>
              </button>
            );
          })}
          <div className="grid grid-cols-4 gap-0 text-xs font-bold bg-muted px-3 py-2 border-t border-border">
            <span>Total</span>
            <span className="text-center text-primary">{p1Total}</span>
            <span className="text-center text-secondary">{p2Total}</span>
            <span></span>
          </div>
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={p1Total > p2Total ? 'Jugador 1' : p2Total > p1Total ? 'Jugador 2' : ''}
        isDraw={p1Total === p2Total}
        onPlayAgain={() => {
          setShowWinner(false);
          setScoreCards({ p1: {}, p2: {} });
          setCurrentPlayer(1);
          setDice([1,1,1,1,1]);
          setRollsLeft(3);
        }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}