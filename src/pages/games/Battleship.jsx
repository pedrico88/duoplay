import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const GRID = 7;
const SHIPS = [3, 2, 2]; // lengths

const emptyGrid = () => Array(GRID).fill(null).map(() => Array(GRID).fill(null));

function placeShipsRandom() {
  const grid = emptyGrid();
  for (const len of SHIPS) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? GRID : GRID - len + 1));
      const c = Math.floor(Math.random() * (horiz ? GRID - len + 1 : GRID));
      let ok = true;
      for (let i = 0; i < len; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (grid[rr][cc] !== null) { ok = false; break; }
      }
      if (ok) {
        for (let i = 0; i < len; i++) {
          const rr = horiz ? r : r + i;
          const cc = horiz ? c + i : c;
          grid[rr][cc] = 'ship';
        }
        placed = true;
      }
    }
  }
  return grid;
}

function CellBtn({ state, onClick, disabled, showShips }) {
  let bg = 'bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900';
  if (state === 'hit') bg = 'bg-red-400';
  else if (state === 'miss') bg = 'bg-slate-300 dark:bg-slate-600';
  else if (state === 'ship' && showShips) bg = 'bg-slate-400 dark:bg-slate-500';
  return (
    <button
      disabled={disabled || state === 'hit' || state === 'miss'}
      onClick={onClick}
      className={`w-9 h-9 rounded border border-blue-200 dark:border-blue-800 text-sm transition-all active:scale-90 ${bg}`}
    >
      {state === 'hit' ? '💥' : state === 'miss' ? '•' : ''}
    </button>
  );
}

export default function Battleship() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, p1place, p1done, p2place, p2done, p1turn, p2turn, finished
  const [p1Ships, setP1Ships] = useState(emptyGrid());
  const [p2Ships, setP2Ships] = useState(emptyGrid());
  const [p1Attacks, setP1Attacks] = useState(emptyGrid()); // what p1 sees when attacking p2
  const [p2Attacks, setP2Attacks] = useState(emptyGrid()); // what p2 sees when attacking p1
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);

  const countHits = (attacks, ships) => {
    let hits = 0;
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++)
        if (attacks[r][c] === 'hit' && ships[r][c] === 'ship') hits++;
    return hits;
  };

  const handleAttack = (r, c, attacker) => {
    if (attacker === 1) {
      const newAtks = p1Attacks.map(row => [...row]);
      newAtks[r][c] = p2Ships[r][c] === 'ship' ? 'hit' : 'miss';
      setP1Attacks(newAtks);
      const hits = countHits(newAtks, p2Ships);
      if (hits >= totalShipCells) {
        setWinner('Jugador 1'); setScores({ p1: 1, p2: 0 });
        recordWin('battleship'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
        setShowWinner(true); return;
      }
      setPhase('p2turn');
    } else {
      const newAtks = p2Attacks.map(row => [...row]);
      newAtks[r][c] = p1Ships[r][c] === 'ship' ? 'hit' : 'miss';
      setP2Attacks(newAtks);
      const hits = countHits(newAtks, p1Ships);
      if (hits >= totalShipCells) {
        setWinner('Jugador 2'); setScores({ p1: 0, p2: 1 });
        recordLoss('battleship'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
        setShowWinner(true); return;
      }
      setPhase('p1turn');
    }
  };

  const autoPlace = (player) => {
    if (player === 1) { setP1Ships(placeShipsRandom()); }
    else { setP2Ships(placeShipsRandom()); }
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <NativeHeader title="Hundir la Flota" backTo="/games" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-6xl">⚓</div>
          <h2 className="font-display text-2xl font-bold text-center">Hundir la Flota</h2>
          <p className="text-muted-foreground text-center text-sm">Hunde todos los barcos del rival antes que él</p>
          <Button className="rounded-2xl px-8 font-display text-lg" onClick={() => { setP1Ships(placeShipsRandom()); setP2Ships(placeShipsRandom()); setP1Attacks(emptyGrid()); setP2Attacks(emptyGrid()); setPhase('p1turn'); }}>
            Jugar con barcos aleatorios 🎲
          </Button>
        </div>
      </div>
    );
  }

  const isP1Turn = phase === 'p1turn';
  const isP2Turn = phase === 'p2turn';
  const attackGrid = isP1Turn ? p1Attacks : p2Attacks;
  const opponentShips = isP1Turn ? p2Ships : p1Ships;
  const ownShips = isP1Turn ? p1Ships : p2Ships;
  const ownAtks = isP1Turn ? p2Attacks : p1Attacks;
  const playerName = isP1Turn ? 'Jugador 1' : 'Jugador 2';

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Hundir la Flota" subtitle={`Turno: ${playerName}`} backTo="/games" />
      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-sm mx-auto w-full">
        <p className="font-display font-bold text-sm text-center">
          <span className={isP1Turn ? 'text-primary' : 'text-secondary'}>{playerName}</span> — Elige dónde atacar
        </p>

        <div>
          <p className="text-xs text-muted-foreground mb-1 text-center">Mapa del rival</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
            {attackGrid.map((row, r) => row.map((cell, c) => (
              <CellBtn key={`${r}-${c}`} state={cell} onClick={() => handleAttack(r, c, isP1Turn ? 1 : 2)} disabled={false} showShips={false} />
            )))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1 text-center">Tu flota</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
            {ownShips.map((row, r) => row.map((cell, c) => (
              <CellBtn key={`own-${r}-${c}`} state={ownAtks[r][c] === 'hit' && cell === 'ship' ? 'hit' : ownAtks[r][c] === 'miss' ? 'miss' : cell} disabled={true} showShips={true} />
            )))}
          </div>
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={winner}
        isDraw={false}
        onPlayAgain={() => { setP1Ships(placeShipsRandom()); setP2Ships(placeShipsRandom()); setP1Attacks(emptyGrid()); setP2Attacks(emptyGrid()); setShowWinner(false); setPhase('p1turn'); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}