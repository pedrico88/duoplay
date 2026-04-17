import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import NativeHeader from '@/components/duoplay/NativeHeader';

const TRUTHS = [
  '¿Cuál es tu mayor miedo?',
  '¿A quién le tienes más cariño de los dos?',
  '¿Cuál es la mentira más grande que has dicho?',
  '¿Qué es lo más vergonzoso que te ha pasado?',
  '¿Cuál es tu peor hábito?',
  '¿Qué cosa nunca le contarías a tus padres?',
  '¿Cuál es la app que más usas en secreto?',
  '¿Qué harías con 1 millón de euros?',
  '¿Cuál ha sido tu peor metedura de pata?',
  '¿Qué es lo que más te gusta de la otra persona?',
  '¿Qué talento secreto tienes?',
  '¿Cuál es tu recuerdo más vergonzoso del colegio?',
  '¿Has roto alguna vez algo y lo has ocultado?',
  '¿Cuál es la cosa más rara que has comido?',
  '¿Qué es lo que más te arrepientes de haber hecho?',
  '¿Cuál es tu crush famoso más vergonzoso?',
  '¿Qué es lo más raro que has buscado en internet?',
  '¿Has llorado con una película de animación? ¿Cuál?',
  '¿Qué canción escuchas en secreto pero jamás admitirías?',
  '¿Cuál es la cosa más estúpida que has hecho por amor?',
  '¿Has fingido estar enfermo para no ir a algún sitio?',
  '¿Cuál es tu mayor defecto?',
  '¿A quién de tu familia le tienes menos paciencia?',
  '¿Cuánto dinero llevas ahora mismo en el bolsillo?',
  '¿Qué harías si tuvieras poderes invisibles durante un día?',
  '¿Cuál es la cosa más cara que has comprado sin necesitarlo?',
  '¿Has leído los mensajes de alguien sin permiso?',
  '¿Qué es lo primero que miras en una persona que te gusta?',
  '¿Cuál es tu mayor adicción sin que lo parezca?',
  '¿Te has hecho el dormido para no hablar con alguien?',
  '¿Cuál es tu nombre de usuario más vergonzoso de la infancia?',
  '¿Qué cosa cambiarías de ti mismo si pudieras?',
  '¿Cuál es el peor regalo que has recibido y qué dijiste?',
  '¿Has mentido en el currículum o en una entrevista?',
  '¿Qué piensas realmente de la moda que llevas el otro jugador?',
  '¿Cuál es la película o serie de la que finges haber visto?',
  '¿A qué persona famosa envidias y por qué?',
  '¿Cuál es el mayor error que has cometido con un amigo?',
  '¿Tienes algún alias o apodo que odias?',
  '¿Qué es lo que más te cuesta admitir que no sabes hacer?',
  '¿Cuál ha sido tu peor cita o quedada?',
  '¿Qué harías diferente si pudieras volver a tener 10 años?',
  '¿Cuál es la cosa más tonta de la que te has enorgullecido?',
  '¿Has copiado en algún examen? ¿Cómo?',
  '¿Cuál es el momento en que más has sentido vergüenza ajena propia?',
  '¿Qué secreto nunca le contarías a tu mejor amigo?',
  '¿Cuántas veces has visto una serie o película entera en un día?',
  '¿Cuál es la excusa más ridicula que has puesto para no salir?',
  '¿Qué comida detestas pero dices que te gusta para quedar bien?',
  '¿Cuál es tu obsesión más rara que nadie conoce?',
];

const DARES = [
  'Imita a un animal durante 30 segundos',
  'Haz 10 flexiones ahora mismo',
  'Di el alfabeto al revés tan rápido como puedas',
  'Llama a alguien de tu agenda y canta "Cumpleaños feliz"',
  'Baila sin música durante 1 minuto',
  'Habla como un robot durante 2 turnos',
  'Haz tu mejor imitación de un político famoso',
  'Di 5 trabalenguas sin equivocarte',
  'Escribe tu nombre con el codo en el aire',
  'Haz una reverencia y di "a su servicio" al otro jugador',
  'Imita al otro jugador durante 1 minuto',
  'Cuenta un chiste. Si no hace gracia, haz 5 sentadillas',
  'Envía un mensaje de voz con una voz graciosa a alguien de tu contactos',
  'Haz el moonwalk por la habitación',
  'Recita un poema inventado de 4 versos sobre la persona que tienes delante',
  'Habla en susurros durante los próximos 3 turnos',
  'Haz tu mejor cara de bebé llorando y aguanta 20 segundos',
  'Ponte en cuclillas y camina así por la habitación',
  'Di una piropo ridículo al otro jugador con toda la seriedad posible',
  'Actúa como si fueras un chef de estrella Michelin describiendo una galleta',
  'Haz 15 saltos de tijera cantando una canción al mismo tiempo',
  'Pon una cara de susto extremo durante 30 segundos sin reírte',
  'Imita a un presentador de televisión describiendo lo que hay en la habitación',
  'Haz una postura de yoga e invéntate un nombre para ella',
  'Explica cómo hervir agua como si fuera la receta más complicada del mundo',
  'Llama a alguien por teléfono y di "¿Eres tú el que me debe dinero?"',
  'Intenta lamer tu codo durante 30 segundos',
  'Di "patata" en 10 idiomas diferentes (puedes inventar los que no sepas)',
  'Actúa como si estuvieras en una película de acción durante 1 minuto',
  'Dibuja al otro jugador con los ojos cerrados en 30 segundos',
  'Haz la mejor imitación de Cristiano Ronaldo celebrando un gol',
  'Habla de ti mismo en tercera persona durante los próximos 2 turnos',
  'Inventa una coreografía de 8 pasos y enséñasela al otro',
  'Haz una entrevista de trabajo imaginaria al otro jugador para el puesto de "superhéroe"',
  'Actúa como si estuvieras viendo el partido de tu vida durante 30 segundos',
  'Di sin parar los nombres de países durante 30 segundos',
  'Haz el mayor grito silencioso que puedas durante 10 segundos',
  'Imita a un youtuber famoso grabando un vídeo',
  'Ponte de pie en un pie durante 1 minuto mientras hablas de tu película favorita',
  'Haz tu mejor imitación de un turista perdido preguntando direcciones',
  'Canta el intro de 3 series de televisión distintas',
  'Actúa como si acabaras de ganar un Oscar y da tu discurso de agradecimiento',
  'Haz 10 sentadillas mientras dices el nombre de un famoso en cada una',
  'Convence al otro jugador de que eres de otro planeta en 1 minuto',
  'Habla como si tuvieras la boca llena durante 1 turno entero',
  'Haz la imitación de cómo crees que el otro jugador duerme',
  'Di trabalenguas del tipo "tres tristes tigres" 3 veces seguidas',
  'Actúa como si estuvieras leyendo las noticias más impactantes del mundo en TV',
  'Haz una reverencia de samurái y di "el honor es mío" con acento japonés',
  'Inventa y canta el jingle de un producto ridículo durante 30 segundos',
];

const PLAYERS = ['Jugador 1', 'Jugador 2'];

export default function TruthOrDare() {
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [card, setCard] = useState(null);
  const [type, setType] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const pick = (t) => {
    const list = t === 'truth' ? TRUTHS : DARES;
    const random = list[Math.floor(Math.random() * list.length)];
    setType(t);
    setCard(random);
    setRevealed(true);
  };

  const next = () => {
    setRevealed(false);
    setCard(null);
    setType(null);
    setCurrentPlayer((p) => (p + 1) % 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex flex-col">
      <NativeHeader title="Verdad o Reto" subtitle="🎯🔥" backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Current player */}
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm">Le toca a</p>
          <h2 className="font-display text-3xl font-bold text-primary">{PLAYERS[currentPlayer]}</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs flex flex-col gap-4"
            >
              <Button
                onClick={() => pick('truth')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-lg"
              >
                🤔 Verdad
              </Button>
              <Button
                onClick={() => pick('dare')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg"
              >
                🔥 Reto
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              className="w-full max-w-sm"
            >
              <div className={`rounded-3xl p-8 text-center shadow-2xl ${type === 'truth' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-orange-500 to-red-500'} text-white`}>
                <p className="text-4xl mb-4">{type === 'truth' ? '🤔' : '🔥'}</p>
                <p className="text-sm font-medium opacity-80 mb-3 uppercase tracking-widest">
                  {type === 'truth' ? 'Verdad' : 'Reto'}
                </p>
                <p className="text-xl font-bold leading-relaxed">{card}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => pick(type)} className="flex-1 rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4" /> Otra
                </Button>
                <Button onClick={next} className="flex-1 rounded-xl bg-primary">
                  Siguiente turno →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}