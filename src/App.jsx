import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { GameProvider } from '@/lib/gameContext.jsx';
import AppLayout from '@/components/duoplay/AppLayout';
import ErrorBoundary from '@/components/duoplay/ErrorBoundary';
import OfflineBanner from '@/components/duoplay/OfflineBanner';
import Home from '@/pages/Home';
import Games from '@/pages/Games';
import Profile from '@/pages/Profile';
import Scores from '@/pages/Scores';
import PlayGame from '@/pages/PlayGame';
import Settings from '@/pages/Settings';
import Tournament from '@/pages/Tournament';
import TournamentResults from '@/pages/TournamentResults';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ minHeight: '100vh' }}>
        <Routes location={location}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/play/:gameId" element={<PlayGame />} />
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/tournament/results" element={<TournamentResults />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <GameProvider>
      <AnimatedRoutes />
    </GameProvider>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <OfflineBanner />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App