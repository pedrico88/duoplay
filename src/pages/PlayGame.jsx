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
import { useAdMob } from '@/lib/useAdMob';
import ErrorBoundary from '@/components/duoplay/ErrorBoundary';

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
  const { recordGameEnd } = useAdMob(!!tournament);

  // Tournament mode: snapshot scores when entering a game
  const baseScoreRef = useRef({ player1: sessionScore.player1, player2: sessionScore.player2 });
  const [gameFinished, setGameFinished] = useState(false);
  const [gameWinner, setGameWinner] = useState(null);

  // Normal mode: track last seen score to avoid double-firing
  const normalBaseRef = useRef({ player1: sessionScore.player1, player2: sessionScore.player2 });
  // Guard to prevent re-entrance
  const processingRef = useRef(false);

  // When gameId changes (tournament navigates to next game), reset state
  useEffect(() => {
    baseScoreRef.current = { player1: sessionScore.player1, player2: sessionScore.player2 };
    normalBaseRef.current = { player1: sessionScore.player1, player2: sessionScore.player2 };
    setGameFinished(false);
    setGameWinner(null);
    processingRef.current = false;
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tournament: detect game end when score increases
  useEffect(() => {
    if (!tournament || gameFinished || processingRef.current) return;
    const base = baseScoreRef.current;
    const p1Gained = sessionScore.player1 > base.player1;
    const p2Gained = sessionScore.player2 > base.player2;
    if (p1Gained || p2Gained) {
      processingRef.current = true;
      const winner = p1Gained && !p2Gained ? 'player1' : !p1Gained && p2Gained ? 'player2' : 'draw';
      setGameWinner(winner);
      setGameFinished(true);
      advanceTournament(winner === 'draw' ? null : winner);
      recordGameEnd();
    }
  }, [sessionScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Normal mode: detect game end
  useEffect(() => {
    if (tournament || processingRef.current) return;
    const base = normalBaseRef.current;
    const p1Gained = sessionScore.player1 > base.player1;
    const p2Gained = sessionScore.player2 > base.player2;
    if (p1Gained || p2Gained) {
      normalBaseRef.current = { player1: sessionScore.player1, player2: sessionScore.player2 };
      recordGameEnd();
    }
  }, [sessionScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if on wrong game in tournament
  useEffect(() => {
    if (!tournament) return;
    const expected = tournament.games[tournament.currentIndex];
    if (expected && gameId !== expected) {
      navigate(`/play/${expected}`, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display text-xl font-bold mb-2">Juego no encontrado</h2>
          <button
            onClick={() => navigate('/games')}
            className="text-primary underline text-sm min-h-[44px] inline-flex items-center"
          >
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
    processingRef.current = false;
    if (isLastGame) {
      navigate('/tournament/results');
    } else {
      const nextGame = tournament.games[tournament.currentIndex];
      navigate(`/play/${nextGame}`);
    }
  };

  return (
    <div className="relative">
      <ErrorBoundary key={gameId}>
        <GameComponent />
      </ErrorBoundary>
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