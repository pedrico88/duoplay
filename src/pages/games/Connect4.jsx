import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';

const ROWS = 6, COLS = 7;

function checkConnect4(board) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c]) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        const cells = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === board[r][c]) {
            count++;
            cells.push([nr, nc]);
          } else break;
        }
        if (count >= 4) return { winner: board[r][c], cells };
      }
    }
  }
  return null;
}

const emptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export default function Connect4() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [board, setBoard] = useState(emptyBoard);
  const [isRedTurn, setIsRedTurn] = useState(true);
  const [scores, setScores] = useState({ R: 0, Y: 0 });
  const [winInfo, setWinInfo] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [lastDrop, setLastDrop] = useState(null);

  const dropPiece = (col) => {
    if (winInfo) return;
    const newBoard = board.map(r => [...r]);
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newBoard[r][col]) { row = r; break; }
    }
    if (row === -1) return;

    const piece = isRedTurn ? 'R' : 'Y';
    newBoard[row][col] = piece;
    setBoard(newBoard);
    setLastDrop({ row, col });

    const result = checkConnect4(newBoard);
    if (result) {
      setWinInfo(result);
      const newScores = { ...scores, [piece]: scores[piece] + 1 };
      setScores(newScores);
      const winnerName = piece === 'R' ? 'Jugador 1 (Rojo)' : 'Jugador 2 (Amarillo)';
      setTimeout(() => {
        setShowWinner(true);
        if (piece === 'R') {
          recordWin('connect4');
          setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
        } else {
          recordLoss('connect4');
          setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
        }
      }, 500);
    } else {
      const isFull = newBoard[0].every(c => c);
      if (isFull) {
        setTimeout(() => setShowWinner(true), 500);
      }
    }
    setIsRedTurn(!isRedTurn);
  };

  const resetAll = () => {
    setBoard(emptyBoard());
    setIsRedTurn(true);
    setWinInfo(null);
    setScores({ R: 0, Y: 0 });
    setLastDrop(null);
  };

  const isWinCell = (r, c) => winInfo?.cells.some(([wr, wc]) => wr === r && wc === c);

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🔴🟡"
        onReset={resetAll}
        player1Score={scores.R}
        player2Score={scores.Y}
        player1Name="🔴"
        player2Name="🟡"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <motion.div
          key={isRedTurn}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`text-base font-display font-bold px-6 py-2 rounded-full ${
            isRedTurn ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}
        >
          Turno de {isRedTurn ? '🔴 Rojo' : '🟡 Amarillo'}
        </motion.div>

        {/* Column selectors */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array(COLS).fill(null).map((_, c) => (
            <button
              key={c}
              onClick={() => dropPiece(c)}
              className="w-11 h-8 flex items-center justify-center rounded-t-lg hover:bg-muted transition-colors"
            >
              <span className={`text-lg ${isRedTurn ? 'text-red-400' : 'text-yellow-400'}`}>▼</span>
            </button>
          ))}
        </div>

        {/* Board */}
        <div className="bg-primary/10 p-2 rounded-2xl">
          <div className="grid grid-cols-7 gap-1">
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => dropPiece(c)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isWinCell(r, c) ? 'ring-3 ring-accent scale-110 z-10' : ''
                  } ${!cell ? 'bg-background' : ''}`}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.div
                        initial={lastDrop?.row === r && lastDrop?.col === c ? { y: -200 } : { scale: 1 }}
                        animate={{ y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`w-9 h-9 rounded-full ${
                          cell === 'R' ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-yellow-400 shadow-lg shadow-yellow-400/30'
                        }`}
                      />
                    )}
                  </AnimatePresence>
                  {!cell && <div className="w-9 h-9 rounded-full bg-muted/50" />}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={winInfo ? (winInfo.winner === 'R' ? 'Jugador 1 (Rojo)' : 'Jugador 2 (Amarillo)') : ''}
        isDraw={showWinner && !winInfo}
        onPlayAgain={() => { setShowWinner(false); resetAll(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}