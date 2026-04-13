import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';

const SIZE = 8;
const SHIPS = [5, 4, 3, 3, 2];

function createEmpty() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)); }

function canPlace(board, r, c, len, horizontal) {
  for (let i = 0; i < len; i++) {
    const nr = horizontal ? r : r + i;
    const nc = horizontal ? c + i : c;
    if (nr >= SIZE || nc >= SIZE || board[nr][nc]) return false;
  }
  return true;
}

function placeShip(board, r, c, len, horizontal, id) {
  const b = board.map(row => [...row]);
  for (let i = 0; i < len; i++) {
    const nr = horizontal ? r : r + i;
    const nc = horizontal ? c + i : c;
    b[nr][nc] = id;
  }
  return b;
}

function autoPlace(ships) {
  let board = createEmpty();
  for (let s = 0; s < ships.length; s++) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const h = Math.random() > 0.5;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (canPlace(board, r, c, ships[s], h)) {
        board = placeShip(board, r, c, ships[s], h, `s${s}`);
        placed = true;
      }
    }
  }
  return board;
}

export default function Battleship() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, p1place, p2place, playing, finished
  const [boards, setBoards] = useState({ p1: createEmpty(), p2: createEmpty() });
  const [shots, setShots] = useState({ p1: createEmpty(), p2: createEmpty() }); // what each player has shot at opponent
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState(null);
  const [lastShot, setLastShot] = useState(null);
  const [showTransition, setShowTransition] = useState(false);

  const startGame = () => {
    setBoards({ p1: autoPlace(SHIPS), p2: autoPlace(SHIPS) });
    setShots({ p1: createEmpty(), p2: createEmpty() });
    setPhase('playing');
    setCurrentPlayer(1);
  };

  const handleShot = (r, c) => {
    if (phase !== 'playing') return;
    const targetKey = currentPlayer === 1 ? 'p2' : 'p1';
    const shooterKey = currentPlayer === 1 ? 'p1' : 'p2';
    
    if (shots[shooterKey][r][c]) return; // already shot

    const newShots = { ...shots };
    newShots[shooterKey] = newShots[shooterKey].map(row => [...row]);
    const hit = boards[targetKey][r][c] !== null;
    newShots[shooterKey][r][c] = hit ? 'hit' : 'miss';
    setShots(newShots);
    setLastShot({ r, c, hit });

    // Check if all ships sunk
    const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);
    const hitCount = newShots[shooterKey].flat().filter(c => c === 'hit').length;
    
    if (hitCount >= totalShipCells) {
      setWinner(currentPlayer);
      setPhase('finished');
      setShowWinner(true);
      if (currentPlayer === 1) {
        recordWin('battleship');
        setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else {
        recordLoss('battleship');
        setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      return;
    }

    // Switch turns with transition screen
    setShowTransition(true);
  };

  const confirmSwitch = () => {
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setShowTransition(false);
    setLastShot(null);
  };

  const renderBoard = (isOwn) => {
    const shooterKey = currentPlayer === 1 ? 'p1' : 'p2';
    const ownKey = currentPlayer === 1 ? 'p1' : 'p2';
    
    return (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array(SIZE).fill(null).map((_, r) =>
          Array(SIZE).fill(null).map((_, c) => {
            let content = '';
            let bg = 'bg-blue-100 dark:bg-blue-900/30';
            
            if (isOwn) {
              // Show own board with ships
              if (boards[ownKey][r][c]) bg = 'bg-gray-400 dark:bg-gray-600';
              const shotAt = (currentPlayer === 1 ? shots.p2 : shots.p1);
              if (shotAt[r][c] === 'hit') { content = '💥'; bg = 'bg-red-200 dark:bg-red-900/30'; }
              else if (shotAt[r][c] === 'miss') { content = '💦'; bg = 'bg-blue-200 dark:bg-blue-800/30'; }
            } else {
              // Show opponent board (no ships visible)
              if (shots[shooterKey][r][c] === 'hit') { content = '💥'; bg = 'bg-red-200 dark:bg-red-900/30'; }
              else if (shots[shooterKey][r][c] === 'miss') { content = '💦'; bg = 'bg-blue-200 dark:bg-blue-800/30'; }
            }

            return (
              <button
                key={`${r}-${c}`}
                onClick={!isOwn ? () => handleShot(r, c) : undefined}
                disabled={isOwn || showTransition}
                className={`aspect-square rounded-sm text-[10px] flex items-center justify-center transition-all ${bg} ${
                  !isOwn && !shots[shooterKey][r][c] && !showTransition ? 'hover:bg-blue-300 dark:hover:bg-blue-700 cursor-crosshair' : ''
                }`}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    );
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader emoji="🚢💥" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Hundir la Flota</h2>
          <p className="text-sm text-muted-foreground text-center">Tablero 8×8 con 5 barcos. Los barcos se colocan automáticamente.</p>
          <p className="text-xs text-muted-foreground">Barcos: 5, 4, 3, 3, 2 casillas</p>
          <Button onClick={startGame} className="rounded-2xl px-8 h-14 font-display text-lg">
            🚀 Comenzar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🚢💥"
        onReset={() => { setPhase('setup'); setWinner(null); }}
        player1Name="J1"
        player2Name="J2"
      />

      {showTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6"
        >
          <div className="text-4xl mb-4">{lastShot?.hit ? '💥' : '💦'}</div>
          <p className="font-display text-xl font-bold mb-2">
            {lastShot?.hit ? '¡Impacto!' : '¡Agua!'}
          </p>
          <p className="text-muted-foreground mb-6">
            Pasa el dispositivo al Jugador {currentPlayer === 1 ? 2 : 1}
          </p>
          <Button onClick={confirmSwitch} className="rounded-xl">Listo</Button>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col items-center p-4 gap-3 overflow-auto">
        <div className={`text-sm font-display font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>
          Turno de Jugador {currentPlayer}
        </div>

        <div className="w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-1 text-center">🎯 Tablero enemigo (toca para disparar)</p>
          {renderBoard(false)}
        </div>

        <div className="w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-1 text-center">🚢 Tu tablero</p>
          <div className="opacity-70 scale-90 origin-top">
            {renderBoard(true)}
          </div>
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={`Jugador ${winner}`}
        onPlayAgain={() => { setShowWinner(false); startGame(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}