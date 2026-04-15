import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { GameProvider } from '@/lib/gameContext.jsx';
import { TabNavProvider } from '@/lib/tabNavContext.jsx';
import ErrorBoundary from '@/components/duoplay/ErrorBoundary';
import OfflineBanner from '@/components/duoplay/OfflineBanner';

// Eagerly-loaded small infra components (not route-level, tiny)
import AppLayout from '@/components/duoplay/AppLayout';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageNotFound from './lib/PageNotFound';

// ── Lazy route-level components ──────────────────────────────────────────────
const Home           = lazy(() => import('@/pages/Home'));
const Games          = lazy(() => import('@/pages/Games'));
const Profile        = lazy(() => import('@/pages/Profile'));
const Scores         = lazy(() => import('@/pages/Scores'));
const PlayGame       = lazy(() => import('@/pages/PlayGame'));
const Settings       = lazy(() => import('@/pages/Settings'));
const Tournament     = lazy(() => import('@/pages/Tournament'));
const TournamentResults = lazy(() => import('@/pages/TournamentResults'));

// ── Shared route-level suspense fallback ─────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background" aria-busy="true" aria-label="Cargando…">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.15, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route element={<AppLayout />}>
              <Route path="/"        element={<Home />} />
              <Route path="/games"   element={<Games />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/scores"  element={<Scores />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/play/:gameId"      element={<PlayGame />} />
            <Route path="/tournament"        element={<Tournament />} />
            <Route path="/tournament/results" element={<TournamentResults />} />
            <Route path="*"                  element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <GameProvider>
      <TabNavProvider>
        <AnimatedRoutes />
      </TabNavProvider>
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
  );
}

export default App;