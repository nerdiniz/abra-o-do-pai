import React, { useState, useEffect } from 'react';
import { ViewState, UserStats, Novena } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Rosary from './views/Rosary';
import Liturgy from './views/Liturgy';
import Journal from './views/Journal';
import Novenas from './views/Novenas';
import Settings from './views/Settings';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import { Menu } from 'lucide-react';
import { ThemeProvider } from './components/ThemeProvider';
import { auth } from './firebase';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);

  // Global State (Transitioning to Firebase)
  const [userStats, setUserStats] = useState<UserStats>({
    massCount: 0,
    rosariesPrayed: 0,
    dailyStreak: 0,
  });

  const [novenas] = useState<Novena[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const { doc, getDoc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js") as any;
          const { db } = await import("./firebase.js") as any;
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(data);
            if (data.stats) {
              setUserStats(data.stats);
            }
          } else {
            const initialProfile = {
              name: "Fiel",
              email: firebaseUser.email,
              stats: { massCount: 0, rosariesPrayed: 0, dailyStreak: 0 }
            };
            await setDoc(doc(db, "users", firebaseUser.uid), initialProfile);
            setUserProfile(initialProfile);
            setUserStats(initialProfile.stats);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile({ name: "Fiel", email: firebaseUser.email });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStats = async (newStats: UserStats) => {
    setUserStats(newStats);
    if (user) {
      try {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js") as any;
        const { db } = await import("./firebase.js") as any;
        await updateDoc(doc(db, "users", user.uid), { stats: newStats });
      } catch (err) {
        console.error("Error updating stats in Firestore:", err);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard stats={userStats} updateStats={handleUpdateStats} novenas={novenas} userName={userProfile?.name || 'Fiel'} />;
      case ViewState.ROSARY:
        return <Rosary stats={userStats} updateStats={handleUpdateStats} />;
      case ViewState.LITURGY:
        return <Liturgy />;
      case ViewState.JOURNAL:
        return <Journal />;
      case ViewState.NOVENAS:
        return <Novenas novenas={novenas} />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard stats={userStats} updateStats={handleUpdateStats} novenas={novenas} userName={userProfile?.name || 'Fiel'} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return isRegistering ? (
      <Register
        onLoginClick={() => setIsRegistering(false)}
        onRegisterSuccess={() => setUser({ email: 'test@example.com' })}
      />
    ) : (
      <Login
        onRegisterClick={() => setIsRegistering(true)}
        onLoginSuccess={() => setUser({ email: 'test@example.com' })}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-800 dark:text-stone-100 transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-gold-200 dark:border-gold-800 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-stone-600 dark:text-stone-300 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded-lg">
            <Menu />
          </button>
          <span className="font-serif font-bold text-lg text-stone-800 dark:text-stone-100">Abraço do Pai</span>
        </div>

        {/* Main Content Area */}
        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;