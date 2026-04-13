import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';

const CARD_EMOJIS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔'];

function shuffleCards(count) {
  const emojis = CARD_EMOJIS.slice(0, count);
  const cards = [...emojis, ...emojis].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function Memory() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [cards, setCards] = useState(() => shuffleCards(8));
  const [flipped, setFlipped] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [showWinner, setShowWinner] = useState(false);
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef(null);

  const handleFlip = (index) => {
    if (locked || cards[index].flipped || cards[index].matched || flipped.length >= 2) return;
    
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        // Match!
        timeoutRef.current = setTimeout(() => {
          const matched = newCards.map((c, i) => i === a || i === b ? { ...c, matched: true } : c);
          setCards(matched);
          const key = currentPlayer === 1 ? 'p1' : 'p2';
          const newScores = { ...scores, [key]: scores[key] + 1 };
          setScores(newScores);
          setFlipped([]);
          setLocked(false);

          // Check if all matched
          if (matched.every(c => c.matched)) {
            setTimeout(() => {
              setShowWinner(true);
              if (newScores.p1 > newScores.p2) {
                recordWin('memory');
                setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
              } else if (newScores.p2 > newScores.p1) {
                recordLoss('memory');
                setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
              }
            }, 300);
          }
        }, 500);
      } else {
        // No match
        timeoutRef.current = setTimeout(() => {
          const reset = newCards.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c);
          setCards(reset);
          setFlipped([]);
          setCurrentPlayer(p => p === 1 ? 2 : 1);
          setLocked(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const resetAll = () => {
    setCards(shuffleCards(8));
    setFlipped([]);
    setCurrentPlayer(1);
    setScores({ p1: 0, p2: 0 });
    setShowWinner(false);
    setLocked(false);
  };

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🃏🧠"
        onReset={resetAll}
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <div className={`text-sm font-display font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>
          Turno de Jugador {currentPlayer}
        </div>

        <div className="grid grid-cols-4 gap-2 max-w-xs w-full">
          {cards.map((card, i) => (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFlip(i)}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${
                card.matched
                  ? 'bg-green-100 dark:bg-green-900/30 scale-90 opacity-60'
                  : card.flipped
                    ? 'bg-card border-2 border-primary'
                    : 'bg-primary/20 hover:bg-primary/30 border-2 border-transparent'
              }`}
            >
              {(card.flipped || card.matched) ? card.emoji : '❓'}
            </motion.button>
          ))}
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={resetAll}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}