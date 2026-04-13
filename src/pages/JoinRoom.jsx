import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGame } from '@/lib/gameContext.jsx';

export default function JoinRoom() {
  const navigate = useNavigate();
  const { profile } = useGame();
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
    // Navigate to room — OnlineRoom will handle joining
    navigate(`/room/${code.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-5 relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-card border border-border">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-5xl">🔑</div>
      <h2 className="font-display text-2xl font-bold">Unirse a sala</h2>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Introduce el código de 6 caracteres que te dio tu amigo
      </p>

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
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 Entrar a la sala'}
      </Button>
    </div>
  );
}