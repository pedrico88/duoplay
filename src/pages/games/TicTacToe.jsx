import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';

function checkWinner(board, size = 3) {
  const need = size === 3 ? 3 : 4;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c]) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let k = 1; k < need; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === board[r][c]) count++;
          else break;
        }
        if (count >= need) {
          const cells = [];
          for (let k = 0; k < need; k++) cells.push([r + dr * k, c + dc * k]);
          return { winner: board[r][c], cells };
        }
      }
    }
  }
  return null;
}

export default function TicTacToe() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, sessionScore, setSessionScore } = useGame();
  const [boardSize, setBoardSize] = useState(3);
  const [board, setBoard] = useState(() => Array(3).fill(null).map(() => Array(3).fill(null)));
  const [isXTurn, setIsXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winInfo, setWinInfo] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [roundWinner, setRoundWinner] = useState('');
  const [seriesWin, setSeriesWin] = useState(null);
  const [showSetup, setShowSetup] = useState(true);

  const resetBoard = useCallback(() => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setIsXTurn(true);
    setWinInfo(null);
  }, [boardSize]);

  const handleCell = (r, c) => {
    if (board[r][c] || winInfo || seriesWin) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = isXTurn ? 'X' : 'O';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard, boardSize);
    if (result) {
      setWinInfo(result);
      const w = result.winner;
      const newScores = { ...scores, [w]: scores[w] + 1 };
      setScores(newScores);
      if (newScores[w] >= 3) {
        setSeriesWin(w);
        setRoundWinner(`Jugador ${w === 'X' ? '1 (X)' : '2 (O)'}`);
        setShowWinner(true);
        if (w === 'X') {
          recordWin('tictactoe');
          setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
        } else {
          recordLoss('tictactoe');
          setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
        }
      } else {
        setTimeout(resetBoard, 1500);
      }
    } else {
      const isFull = newBoard.every(row => row.every(cell => cell));
      if (isFull) setTimeout(resetBoard, 1000);
    }
    setIsXTurn(!isXTurn);
  };

  const resetAll = () => {
    setScores({ X: 0, O: 0 });
    setSeriesWin(null);
    setWinInfo(null);
    resetBoard();
  };

  const startGame = (size) => {
    setBoardSize(size);
    setBoard(Array(size).fill(null).map(() => Array(size).fill(null)));
    setShowSetup(false);
  };

  const isWinCell = (r, c) => winInfo?.cells.some(([wr, wc]) => wr === r && wc === c);
  const cellSize = boardSize === 3 ? 'w-24 h-24 text-4xl' : 'w-16 h-16 text-2xl';

  if (showSetup) {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader title="Tres en Raya" emoji="❌⭕" onReset={null} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Elige el tablero</h2>
          <div className="flex gap-4">
            <Button onClick={() => startGame(3)} className="h-24 w-32 rounded-2xl font-display text-lg flex flex-col gap-1">
              <span className="text-3xl">3×3</span>
              <span className="text-xs opacity-70">Clásico</span>
            </Button>
            <Button onClick={() => startGame(5)} variant="outline" className="h-24 w-32 rounded-2xl font-display text-lg flex flex-col gap-1">
              <span className="text-3xl">5×5</span>
              <span className="text-xs opacity-70">4 en línea</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        title="Tres en Raya"
        emoji="❌⭕"
        onReset={resetAll}
        player1Score={scores.X}
        player2Score={scores.O}
        player1Name="X"
        player2Name="O"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Turn indicator */}
        <motion.div
          key={isXTurn}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-lg font-display font-bold px-6 py-2 rounded-full ${
            isXTurn ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
          }`}
        >
          Turno de {isXTurn ? 'X' : 'O'}
        </motion.div>

        {/* Board */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <motion.button
                key={`${r}-${c}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCell(r, c)}
                className={`${cellSize} rounded-2xl font-display font-bold flex items-center justify-center transition-all ${
                  isWinCell(r, c)
                    ? 'bg-accent text-accent-foreground ring-4 ring-accent/50 scale-105'
                    : cell
                      ? 'bg-card border-2 border-border'
                      : 'bg-muted hover:bg-muted/70 border-2 border-transparent'
                } ${cell === 'X' ? 'text-primary' : 'text-secondary'}`}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Primero en ganar 3 rondas gana la serie
        </p>
      </div>

      <WinnerModal
        show={showWinner}
        winner={roundWinner}
        onPlayAgain={() => { setShowWinner(false); resetAll(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}