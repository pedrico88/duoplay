import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/lib/gameContext.jsx';
import { GAMES } from '@/lib/gameData';
import { Copy, Check, Loader2, ArrowLeft, Wifi } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TurnIndicator from '@/components/duoplay/TurnIndicator';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Phase: pick game ──────────────────────────────────────────────────────────
function GamePicker({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="min-h-screen flex flex-col p-6 pt-16">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-card border border-border">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🌐</div>
        <h2 className="font-display text-2xl font-bold">Jugar Online</h2>
        <p className="text-sm text-muted-foreground mt-1">Elige el juego para tu sala</p>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => setSelected(game.id)}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              selected === game.id
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-border bg-card hover:border-primary/40 active:scale-[0.97]'
            }`}
          >
            <span className="text-3xl">{game.emoji}</span>
            <p className="text-xs font-semibold mt-2 leading-tight">{game.name}</p>
          </button>
        ))}
      </div>
      <Button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="w-full rounded-2xl h-14 font-display text-base mt-4"
      >
        Crear Sala 🏠
      </Button>
    </div>
  );
}

// ── Phase: waiting (host) ─────────────────────────────────────────────────────
function WaitingLobby({ room, onBack }) {
  const [copied, setCopied] = useState(false);
  const game = GAMES.find(g => g.id === room.game);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-5 relative">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-card border border-border">
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Game badge */}
      <div className={`bg-gradient-to-br ${game?.color} p-4 rounded-3xl shadow-xl`}>
        <span className="text-5xl">{game?.emoji}</span>
      </div>
      <h2 className="font-display text-xl font-bold">{game?.name} — Sala creada</h2>

      {/* Big code display */}
      <div className="w-full max-w-xs bg-card rounded-3xl border-2 border-dashed border-primary/60 p-6 text-center shadow-lg">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Código de sala</p>
        <p className="font-mono text-5xl font-black tracking-[0.25em] text-primary select-all">
          {room.code}
        </p>
        <p className="text-xs text-muted-foreground mt-2">Comparte este código con tu amigo</p>
      </div>

      <Button onClick={copyCode} variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-2 font-semibold">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        {copied ? '¡Copiado!' : 'Copiar código'}
      </Button>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Esperando a que se una alguien…
      </div>
    </div>
  );
}

// ── Phase: join by code ───────────────────────────────────────────────────────
function JoinByCode({ onBack, onJoin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    const rooms = await base44.entities.GameRoom.filter({ code: code.toUpperCase() });
    if (!rooms || rooms.length === 0) {
      setError('Sala no encontrada. Revisa el código.');
      setLoading(false);
      return;
    }
    onJoin(rooms[0]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-5 relative">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-card border border-border">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-5xl">🔑</div>
      <h2 className="font-display text-2xl font-bold">Unirse a sala</h2>
      <p className="text-sm text-muted-foreground text-center">Introduce el código que te dio tu amigo</p>
      <Input
        placeholder="XXXXXX"
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError(''); }}
        className="text-center text-3xl font-mono tracking-[0.4em] h-16 rounded-2xl uppercase max-w-xs w-full border-2"
        maxLength={6}
        autoFocus
      />
      {error && <p className="text-destructive text-sm text-center">{error}</p>}
      <Button
        onClick={handleJoin}
        disabled={code.length !== 6 || loading}
        className="w-full max-w-xs rounded-2xl h-14 font-display text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 Entrar'}
      </Button>
    </div>
  );
}

// ── Phase: playing (both players ready) ──────────────────────────────────────
function PlayingLobby({ room, onNavigate, onBack }) {
  const game = GAMES.find(g => g.id === room.game);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-5 relative">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-card border border-border">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">
        🎮
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-center">¡Ambos conectados!</h2>
      <div className="flex items-center gap-3 bg-card rounded-2xl border border-border px-5 py-3">
        <span className="text-xl">{room.host_avatar}</span>
        <span className="font-bold text-sm">{room.host_nickname}</span>
        <span className="text-muted-foreground text-xs font-bold">VS</span>
        <span className="font-bold text-sm">{room.guest_nickname}</span>
        <span className="text-xl">{room.guest_avatar}</span>
      </div>
      {room.current_turn && <TurnIndicator room={room} />}
      <Button
        onClick={onNavigate}
        className={`w-full max-w-xs rounded-2xl h-14 font-display text-base bg-gradient-to-r ${game?.color}`}
      >
        {game?.emoji} Jugar {game?.name}
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnlineRoom() {
  const { code: urlCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useGame();
  const { toast } = useToast();

  // Possible phases: 'pick' | 'waiting' | 'join' | 'playing' | 'loading' | 'error'
  const [phase, setPhase] = useState(urlCode ? 'loading' : 'pick');
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [prevTurn, setPrevTurn] = useState(null);

  // If URL has a code, join directly
  useEffect(() => {
    if (!urlCode) return;
    const joinFromUrl = async () => {
      try {
        const rooms = await base44.entities.GameRoom.filter({ code: urlCode.toUpperCase() });
        if (!rooms || rooms.length === 0) {
          setError('Sala no encontrada. Verifica el código.');
          setPhase('error');
          return;
        }
        const r = rooms[0];
        const user = await base44.auth.me();

        if (r.status === 'waiting' && !r.guest_email && user.email !== r.host_email) {
          const updated = await base44.entities.GameRoom.update(r.id, {
            guest_email: user.email,
            guest_nickname: profile.nickname || 'Jugador 2',
            guest_avatar: profile.avatar || '🤖',
            status: 'playing',
          });
          setRoom(updated || { ...r, guest_email: user.email, guest_nickname: profile.nickname || 'Jugador 2', guest_avatar: profile.avatar || '🤖', status: 'playing' });
          setPhase('playing');
        } else if (user.email === r.host_email) {
          // Host rejoining
          setRoom(r);
          setPhase(r.status === 'playing' ? 'playing' : 'waiting');
        } else {
          // Guest rejoining or spectating
          setRoom(r);
          setPhase(r.status === 'playing' ? 'playing' : 'waiting');
        }
      } catch (err) {
        console.error('Error joining room:', err);
        setError('Error al conectar con la sala: ' + (err?.message || 'inténtalo de nuevo'));
        setPhase('error');
      }
    };
    joinFromUrl();
  }, [urlCode]);

  // Create room after picking game
  const handleCreateRoom = async (gameId) => {
    setPhase('loading');
    const code = generateCode();
    const user = await base44.auth.me();
    const newRoom = await base44.entities.GameRoom.create({
      code,
      host_email: user.email,
      host_nickname: profile.nickname || 'Jugador 1',
      host_avatar: profile.avatar || '😎',
      game: gameId,
      status: 'waiting',
      game_state: {},
      host_score: 0,
      guest_score: 0,
      chat_messages: [],
    });
    setRoom(newRoom);
    // Update URL so it's shareable
    navigate(`/room/${newRoom.code}`, { replace: true });
    setPhase('waiting');
  };

  // Handle join from JoinByCode component
  const handleJoinRoom = async (r) => {
    const user = await base44.auth.me();
    if (r.status === 'waiting' && !r.guest_email && user.email !== r.host_email) {
      await base44.entities.GameRoom.update(r.id, {
        guest_email: user.email,
        guest_nickname: profile.nickname || 'Jugador 2',
        guest_avatar: profile.avatar || '🤖',
        status: 'playing',
      });
      setRoom({ ...r, guest_email: user.email, guest_nickname: profile.nickname || 'Jugador 2', guest_avatar: profile.avatar || '🤖', status: 'playing' });
    } else {
      setRoom(r);
    }
    setPhase('playing');
  };

  // Real-time subscription
  useEffect(() => {
    if (!room?.id) return;
    const unsub = base44.entities.GameRoom.subscribe(async (event) => {
      if (event.id !== room.id) return;
      const newRoom = event.data;
      setRoom(newRoom);
      if (newRoom.status === 'playing' && phase === 'waiting') {
        setPhase('playing');
        toast({ title: '¡Tu amigo se unió! 🎉', description: 'La partida está lista', duration: 3000 });
      }
      const user = await base44.auth.me();
      if (newRoom.current_turn === user.email && prevTurn !== user.email && newRoom.status === 'playing') {
        toast({ title: '¡Es tu turno! 🎯', description: 'Haz tu movimiento', duration: 2500 });
      }
      setPrevTurn(newRoom.current_turn);
    });
    return unsub;
  }, [room?.id, phase, prevTurn]);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-5xl">😕</div>
        <p className="font-display font-bold text-xl">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-2xl h-12 px-6">
          ← Volver
        </Button>
      </div>
    );
  }

  if (phase === 'pick') {
    return <GamePicker onSelect={handleCreateRoom} onBack={() => navigate(-1)} />;
  }

  if (phase === 'join') {
    return <JoinByCode onBack={() => setPhase('pick')} onJoin={handleJoinRoom} />;
  }

  if (phase === 'waiting' && room) {
    return <WaitingLobby room={room} onBack={() => navigate(-1)} />;
  }

  if (phase === 'playing' && room) {
    return (
      <PlayingLobby
        room={room}
        onBack={() => navigate(-1)}
        onNavigate={() => navigate(`/play/${room.game}?mode=online&roomId=${room.id}`)}
      />
    );
  }

  return null;
}