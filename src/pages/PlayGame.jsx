import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicTacToe from './games/TicTacToe';
import Connect4 from './games/Connect4';
import RockPaperScissors from './games/RockPaperScissors';
import WordGuess from './games/WordGuess';
import TapRace from './games/TapRace';
import Trivia from './games/Trivia';
import TruthOrDare from './games/TruthOrDare';
import GuessNumber from './games/GuessNumber';
import Memory from './games/Memory';
import MathRace from './games/MathRace';
import { useGame } from '@/lib/gameContext.jsx';
import TournamentBanner from '@/components/duoplay/TournamentBanner';

const GAME_MAP = {
  tictactoe: TicTacToe,
  connect4: Connect4,
  rps: RockPaperScissors,
  wordguess: WordGuess,
  taprace: TapRace,
  trivia: Trivia,
  truthordare: TruthOrDare,
  guessnumber: GuessNumber,
  memory: Memory,
  mathrace: MathRace,
};

export default function PlayGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { tournament, advanceTournament, endTournament, sessionScore, setSessionScore } = useGame();
  const GameComponent = GAME_MAP[gameId];

  // Track session score at game start to detect a winner
  const baseScoreRef = useRef({ player1: 0, player2: 0 });
  const [gameFinished, setGameFinished] = useState(false);
  const [gameWinner, setGameWinner] = useState(null); // 'player1' | 'player2' | 'draw'

  // When entering a game in tournament mode, snapshot current scores
  useEffect(() => {
    if (!tournament) return;
    baseScoreRef.current = { ...sessionScore };
    setGameFinished(false);
    setGameWinner(null);
  }, [gameId]);

  // Watch sessionScore for changes (game ended when score increases)
  useEffect(() => {
    if (!tournament || gameFinished) return;
    const base = baseScoreRef.current;
    const p1Gained = sessionScore.player1 > base.player1;
    const p2Gained = sessionScore.player2 > base.player2;
    if (p1Gained || p2Gained) {
      const winner = p1Gained && !p2Gained ? 'player1' : !p1Gained && p2Gained ? 'player2' : 'draw';
      setGameWinner(winner);
      setGameFinished(true);
      advanceTournament(winner === 'draw' ? null : winner);
    }
  }, [sessionScore, tournament, gameFinished]);

  // Redirect to correct game if somehow on wrong game
  useEffect(() => {
    if (!tournament) return;
    const expected = tournament.games[tournament.currentIndex];
    if (expected && gameId !== expected) {
      navigate(`/play/${expected}`, { replace: true });
    }
  }, []);

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display text-xl font-bold mb-2">Juego no encontrado</h2>
          <button onClick={() => navigate('/games')} className="text-primary underline text-sm">
            Volver a juegos
          </button>
        </div>
      </div>
    );
  }

  const isLastGame = tournament && tournament.currentIndex >= tournament.games.length;

  const handleNextGame = () => {
    setGameFinished(false);
    setGameWinner(null);
    if (isLastGame) {
      navigate('/tournament/results');
    } else {
      const nextGame = tournament.games[tournament.currentIndex];
      setSessionScore(prev => ({ ...prev })); // no-op to trigger re-render
      navigate(`/play/${nextGame}`);
    }
  };

  return (
    <div className="relative">
      <GameComponent />
      {tournament && gameFinished && (
        <TournamentBanner
          winner={gameWinner}
          currentIndex={tournament.currentIndex}
          totalGames={tournament.games.length}
          scores={tournament.scores}
          isLast={isLastGame}
          onNext={handleNextGame}
          onAbort={() => { endTournament(); navigate('/games'); }}
        />
      )}
    </div>
  );
}