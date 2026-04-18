import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';

const QUESTIONS = [
  { a: "¿Nunca poder usar internet?", b: "¿No poder ver a nadie en persona?" },
  { a: "¿Saber cuándo vas a morir?", b: "¿Saber cómo vas a morir?" },
  { a: "¿Volar?", b: "¿Ser invisible?" },
  { a: "¿Hablar todos los idiomas?", b: "¿Tocar todos los instrumentos perfectamente?" },
  { a: "¿Ser muy rico pero feo?", b: "¿Ser muy guapo pero pobre?" },
  { a: "¿Vivir 150 años con salud mediocre?", b: "¿Vivir 80 años con salud perfecta?" },
  { a: "¿Nunca sentir hambre ni sed?", b: "¿Nunca sentir cansancio ni necesitar dormir?" },
  { a: "¿Saber todos los secretos de tus amigos?", b: "¿Que tus amigos sepan todos tus secretos?" },
  { a: "¿Parar el tiempo?", b: "¿Viajar al futuro?" },
  { a: "¿Olvidar todos tus recuerdos?", b: "¿No poder hacer nuevos recuerdos?" },
  { a: "¿Tener 10 millones pero no poder viajar?", b: "¿Viajar gratis pero ganar solo lo mínimo?" },
  { a: "¿Ser famoso pero infeliz?", b: "¿Ser desconocido pero muy feliz?" },
  { a: "¿Nunca mentir?", b: "¿Nunca poder decir la verdad?" },
  { a: "¿Perder todos tus contactos del móvil?", b: "¿Perder todas las fotos de tu vida?" },
  { a: "¿No tener trabajo pero tener tiempo infinito?", b: "¿Trabajar 80h semanales pero ganar muy bien?" },
  { a: "¿Vivir sin música?", b: "¿Vivir sin películas ni series?" },
  { a: "¿Ser capaz de leer mentes?", b: "¿Poder ver el futuro?" },
  { a: "¿No usar redes sociales nunca más?", b: "¿No ver a tus amigos en persona nunca más?" },
  { a: "¿Tener la inteligencia de Einstein?", b: "¿Tener la belleza del modelo más atractivo del mundo?" },
  { a: "¿Ser inmortal?", b: "¿Reencarnarte en otra persona?" },
  { a: "¿No poder comer tu comida favorita?", b: "¿No poder escuchar tu música favorita?" },
  { a: "¿Hablar en público ante un millón de personas?", b: "¿Saber que todos piensan en ti en mal momento?" },
  { a: "¿Tener una relación perfecta pero sin pasión?", b: "¿Tener pasión descontrolada pero con muchos conflictos?" },
  { a: "¿Nunca equivocarte?", b: "¿Equivocarte el doble pero aprender el triple?" },
  { a: "¿Saber con certeza si existe la vida después de la muerte?", b: "¿Tener la paz de no saberlo nunca?" },
  { a: "¿Perder tu sentido del humor?", b: "¿Perder tu capacidad de enamorarte?" },
  { a: "¿Que la gente sepa todo lo que piensas?", b: "¿No poder expresar nada de lo que sientes?" },
  { a: "¿Comer solo pizza el resto de tu vida?", b: "¿Comer solo sushi el resto de tu vida?" },
  { a: "¿Ser el más listo de los tontos?", b: "¿Ser el más tonto de los listos?" },
  { a: "¿Descubrir que tu vida es un sueño?", b: "¿Descubrir que eres un personaje de ficción?" },
  { a: "¿No poder reír nunca más?", b: "¿No poder llorar nunca más?" },
  { a: "¿Ser el único humano en el planeta?", b: "¿Ser uno de un billón de humanos idénticos?" },
  { a: "¿Tener el poder de curar enfermedades?", b: "¿Tener el poder de acabar con todos los conflictos?" },
  { a: "¿Tener acceso a todo el conocimiento humano?", b: "¿Tener sabiduría perfecta para tomar decisiones?" },
  { a: "¿Vivir en el pasado?", b: "¿Vivir en el futuro?" },
  { a: "¿Que todos te recuerden pero te odien?", b: "¿Que nadie te recuerde pero te quieran?" },
  { a: "¿Tener supervelocidad?", b: "¿Tener superfuerza?" },
  { a: "¿Hablar con animales?", b: "¿Hablar con objetos?" },
  { a: "¿No tener dolor físico nunca más?", b: "¿No sentir dolor emocional nunca más?" },
  { a: "¿Ganar el Nobel de la Paz?", b: "¿Ganar el Nobel de Literatura?" },
  { a: "¿Saber en qué piensan los demás?", b: "¿Que nadie sepa lo que piensas tú?" },
  { a: "¿Vivir solo en el espacio?", b: "¿Vivir solo en el fondo del océano?" },
  { a: "¿Que tu peor miedo se hiciera realidad?", b: "¿Vivir sin ningún miedo pero sin adrenalina?" },
  { a: "¿Tener 5 mejores amigos para siempre?", b: "¿Tener 100 conocidos con los que nunca profundizas?" },
  { a: "¿Ser el presidente de tu país?", b: "¿Ser el CEO de la empresa más poderosa del mundo?" },
  { a: "¿Perder el olfato?", b: "¿Perder el gusto?" },
  { a: "¿Tener una mente de genio matemático?", b: "¿Tener el talento artístico del mejor artista de la historia?" },
  { a: "¿Conocer a tu yo del futuro?", b: "¿Conocer a tu yo del pasado?" },
  { a: "¿Vivir un año siendo otra persona?", b: "¿Vivir un año siendo el mejor versión de ti mismo?" },
  { a: "¿Tener un día extra a la semana que solo tú conoces?", b: "¿Que el tiempo pase el doble de lento para ti?" },
  { a: "¿Ser siempre el primero en llegar a los sitios?", b: "¿Llegar siempre 5 minutos tarde?" },
  { a: "¿Perder todos tus logros pero ser más feliz?", b: "¿Conservar todos tus logros pero ser indiferente?" },
  { a: "¿Que tu cerebro funcione el doble de rápido?", b: "¿Que tu cuerpo se recupere el doble de rápido?" },
  { a: "¿Saber cocinar como un chef estrella?", b: "¿Saber cantar como el mejor cantante del mundo?" },
  { a: "¿Tener el trabajo de tus sueños sin cobrar?", b: "¿Tener el trabajo que odias pero ganar una fortuna?" },
  { a: "¿Vivir sin Netflix?", b: "¿Vivir sin Spotify?" },
  { a: "¿Tener memoria perfecta?", b: "¿Poder olvidar lo que quieras?" },
  { a: "¿Ser el mejor en algo que nadie valora?", b: "¿Ser mediocre en algo que todo el mundo admira?" },
  { a: "¿Tener gemelos idénticos a ti?", b: "¿Ser tú mismo pero el único ejemplar?" },
  { a: "¿Nunca aburrirte?", b: "¿Nunca sentir ansiedad?" },
  { a: "¿Descubrir que eres adoptado?", b: "¿Descubrir que tienes un hermano/a que no conocías?" },
];

const PLAYERS = ['Jugador 1', 'Jugador 2'];

export default function WouldYouRather() {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [qIndex, setQIndex] = useState(Math.floor(Math.random() * QUESTIONS.length));
  const [chosen, setChosen] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const q = QUESTIONS[qIndex];

  const pick = (side) => {
    setChosen(side);
    setShowResult(true);
  };

  const next = () => {
    let next;
    do { next = Math.floor(Math.random() * QUESTIONS.length); } while (next === qIndex);
    setQIndex(next);
    setChosen(null);
    setShowResult(false);
    setCurrentPlayer(p => (p + 1) % 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex flex-col">
      <NativeHeader title="¿Qué preferirías?" subtitle="🤔💭" backTo="/games" />
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <motion.div key={currentPlayer} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-muted-foreground text-sm">Le toca a</p>
          <h2 className="font-display text-2xl font-bold text-primary">{PLAYERS[currentPlayer]}</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={qIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex flex-col gap-4">
            <p className="text-center text-muted-foreground font-medium text-sm">¿Qué preferirías...?</p>
            <button onClick={() => !showResult && pick('a')} className={`p-5 rounded-2xl text-left font-bold text-base transition-all active:scale-[0.97] border-2 ${showResult && chosen === 'a' ? 'bg-primary text-primary-foreground border-primary' : showResult ? 'bg-muted/40 border-border opacity-50' : 'bg-card border-border hover:border-primary'}`}>
              <span className="text-2xl mr-2">🅰️</span> {q.a}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground font-display font-bold text-sm">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button onClick={() => !showResult && pick('b')} className={`p-5 rounded-2xl text-left font-bold text-base transition-all active:scale-[0.97] border-2 ${showResult && chosen === 'b' ? 'bg-secondary text-secondary-foreground border-secondary' : showResult ? 'bg-muted/40 border-border opacity-50' : 'bg-card border-border hover:border-secondary'}`}>
              <span className="text-2xl mr-2">🅱️</span> {q.b}
            </button>
          </motion.div>
        </AnimatePresence>

        {showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex gap-3">
            <Button variant="outline" onClick={() => { setChosen(null); setShowResult(false); }} className="flex-1 rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Otra pregunta
            </Button>
            <Button onClick={next} className="flex-1 rounded-xl">Siguiente →</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}