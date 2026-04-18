import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { Trash2, Check, X } from 'lucide-react';
import { useGame } from '@/lib/gameContext.jsx';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useNavigate } from 'react-router-dom';

const WORDS = [
  'pizza', 'elefante', 'bicicleta', 'castillo', 'guitarra', 'mariposa', 'astronauta', 'pingüino',
  'dinosaurio', 'volcán', 'submarino', 'cohete', 'bruja', 'unicornio', 'dragón', 'pirata',
  'sirena', 'tornado', 'iglú', 'sombrero', 'cactus', 'arcoíris', 'robot', 'tesoro',
  'monstruo', 'globo', 'barco', 'tren', 'helicóptero', 'tiburón', 'oso polar', 'jirafa',
  'canguro', 'murciélago', 'loro', 'flamenco', 'caballito de mar', 'medusa', 'pulpo', 'cocodrilo',
  'espada', 'escudo', 'corona', 'varita mágica', 'poción', 'mapa', 'brújula', 'linterna',
  'cámara', 'ordenador', 'teléfono', 'televisor', 'nevera', 'lavadora', 'aspiradora', 'piano',
  'violín', 'trompeta', 'micrófono', 'altavoz', 'auriculares', 'gafas', 'paraguas', 'maleta',
  'mochila', 'bolso', 'zapato', 'calcetín', 'bufanda', 'guante', 'sombrero', 'gorra',
  'pelota', 'raqueta', 'bate', 'casco', 'patines', 'esquís', 'tabla de surf', 'cometa',
  'columpio', 'tobogán', 'trampolín', 'escalera', 'puerta', 'ventana', 'chimenea', 'escaleras',
  'árbol', 'flor', 'hongo', 'cactus', 'palmera', 'semilla', 'fruta', 'verdura',
  'sol', 'luna', 'estrella', 'nube', 'rayo', 'nieve', 'ola', 'montaña',
  'playa', 'desierto', 'selva', 'lago', 'río', 'puente', 'faro', 'isla',
  'ciudad', 'pueblo', 'granja', 'zoo', 'circo', 'teatro', 'estadio', 'hospital',
  'bombero', 'policía', 'médico', 'chef', 'cantante', 'bailarín', 'mago', 'superhéroe',
];

const COLORS = ['#1a1a1a', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c'];
const SIZES = [3, 6, 12, 20];

export default function DrawAndGuess() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#1a1a1a');
  const [size, setSize] = useState(6);
  const [phase, setPhase] = useState('setup'); // setup, drawing, guessing, result
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1=drawer, 2=guesser
  const [word, setWord] = useState('');
  const [guess, setGuess] = useState('');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(6);
  const [lastResult, setLastResult] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [savedImage, setSavedImage] = useState(null);
  const timerRef = useRef(null);
  const lastPos = useRef(null);

  const getCanvas = () => canvasRef.current;
  const getCtx = () => getCanvas()?.getContext('2d');

  const clearCanvas = () => {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const canvas = getCanvas();
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setDrawing(false);

  const pickWord = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setPhase('drawing');
    setTimeLeft(60);
    clearCanvas();
  };

  useEffect(() => {
    if (phase !== 'drawing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          const canvas = canvasRef.current;
          if (canvas) setSavedImage(canvas.toDataURL());
          setPhase('guessing');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const submitGuess = () => {
    clearInterval(timerRef.current);
    if (canvasRef.current) setSavedImage(canvasRef.current.toDataURL());
    const correct = guess.trim().toLowerCase() === word.toLowerCase();
    setLastResult(correct);
    if (correct) {
      const guesserKey = currentPlayer === 1 ? 'p2' : 'p1';
      setScores(prev => ({ ...prev, [guesserKey]: prev[guesserKey] + 1 }));
    }
    setPhase('result');
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      if (scores.p1 > scores.p2) {
        recordWin('drawguess');
        setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else if (scores.p2 > scores.p1) {
        recordLoss('drawguess');
        setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      setShowWinner(true);
      return;
    }
    setRound(r => r + 1);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setGuess('');
    setLastResult(null);
    setSavedImage(null);
    setPhase('setup');
  };

  const drawerName = `Jugador ${currentPlayer}`;
  const guesserName = `Jugador ${currentPlayer === 1 ? 2 : 1}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
      <NativeHeader
        title="Dibuja y Adivina"
        subtitle={`Ronda ${round}/${totalRounds} · J1: ${scores.p1} J2: ${scores.p2}`}
        backTo="/games"
      />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        {phase === 'setup' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
            <div className="text-6xl">🎨</div>
            <p className="font-display text-xl font-bold text-center">Le toca dibujar a<br /><span className="text-primary">{drawerName}</span></p>
            <p className="text-muted-foreground text-sm text-center">Pulsa para ver la palabra secreta (¡que el otro no mire!)</p>
            <Button onClick={pickWord} className="rounded-2xl px-8 py-4 text-lg font-display">
              Ver palabra secreta 👀
            </Button>
          </motion.div>
        )}

        {phase === 'drawing' && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <div className="bg-primary text-primary-foreground rounded-xl px-4 py-2 font-display font-bold text-lg">
                {word}
              </div>
              <span className={`font-display text-xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / 60) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full rounded-2xl border-2 border-border bg-white touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <div className="flex gap-2 flex-wrap justify-center">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-foreground' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
              <button onClick={() => setColor('#ffffff')} className={`w-8 h-8 rounded-full border-2 transition-transform ${color === '#ffffff' ? 'scale-125 border-foreground' : 'border-border'}`} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="flex gap-2 items-center justify-center">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`rounded-full bg-foreground transition-transform ${size === s ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`} style={{ width: s + 12, height: s + 12 }} />
              ))}
              <button onClick={clearCanvas} className="ml-4 p-2 rounded-xl bg-muted hover:bg-muted/70">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <Button onClick={() => {
              clearInterval(timerRef.current);
              const canvas = canvasRef.current;
              if (canvas) setSavedImage(canvas.toDataURL());
              setPhase('guessing');
            }} variant="outline" className="rounded-xl">
              ¡Ya terminé! →
            </Button>
          </div>
        )}

        {phase === 'guessing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6 w-full">
            <p className="font-display text-lg font-bold text-center">¡Ahora adivina, <span className="text-secondary">{guesserName}</span>!</p>
            {savedImage
              ? <img src={savedImage} alt="Dibujo" className="w-full rounded-2xl border-2 border-border bg-white" />
              : <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-2xl border-2 border-border bg-white pointer-events-none" />
            }
            <input
              className="w-full p-4 rounded-2xl border-2 border-border bg-card text-center font-display text-lg focus:border-primary outline-none"
              placeholder="Escribe tu respuesta..."
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guess.trim() && submitGuess()}
            />
            <Button onClick={submitGuess} disabled={!guess.trim()} className="rounded-2xl font-display text-lg">
              ¡Es mi respuesta! ✋
            </Button>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
            <div className="text-7xl">{lastResult ? '🎉' : '😅'}</div>
            <h2 className="font-display text-2xl font-bold text-center">{lastResult ? '¡Correcto!' : 'No ha sido...'}</h2>
            <p className="text-muted-foreground text-center">La palabra era: <span className="font-bold text-foreground text-xl">{word}</span></p>
            {!lastResult && <p className="text-muted-foreground text-center">{guesserName} respondió: <span className="font-medium text-foreground">"{guess}"</span></p>}
            <div className="flex gap-4 text-center">
              <div><p className="text-xs text-muted-foreground">Jugador 1</p><p className="text-2xl font-display font-bold text-primary">{scores.p1}</p></div>
              <div><p className="text-xs text-muted-foreground">Jugador 2</p><p className="text-2xl font-display font-bold text-secondary">{scores.p2}</p></div>
            </div>
            <Button onClick={nextRound} className="rounded-2xl px-8 font-display">
              {round >= totalRounds ? 'Ver resultado final' : 'Siguiente ronda →'}
            </Button>
          </motion.div>
        )}
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setPhase('setup'); setScores({ p1: 0, p2: 0 }); setRound(1); setCurrentPlayer(1); setGuess(''); setWord(''); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}