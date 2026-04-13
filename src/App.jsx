import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { GameProvider } from '@/lib/gameContext.jsx';
import AppLayout from '@/components/duoplay/AppLayout';
import Home from '@/pages/Home';
import Games from '@/pages/Games';
import Profile from '@/pages/Profile';
import Scores from '@/pages/Scores';
import PlayGame from '@/pages/PlayGame';
import OnlineRoom from '@/pages/OnlineRoom';
import Settings from '@/pages/Settings';

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
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/play/:gameId" element={<PlayGame />} />
        <Route path="/room/:code" element={<OnlineRoom />} />
        <Route path="/create-room" element={<OnlineRoom />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </GameProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App