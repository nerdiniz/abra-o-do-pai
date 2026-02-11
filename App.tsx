import React, { useState, useEffect } from 'react';
import { ViewState, UserStats, Novena } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Rosary from './views/Rosary';
import Liturgy from './views/Liturgy';
import Journal from './views/Journal';
import Novenas from './views/Novenas';
import Settings from './views/Settings';
import Examen from './views/Examen';
import RequestHelp from './views/RequestHelp';
import AssistBrother from './views/AssistBrother';
import MyRequests from './views/MyRequests';
import Chat from './views/Chat';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import { Menu, MessageSquare } from 'lucide-react';
import { ThemeProvider } from './components/ThemeProvider';
import { auth, db, doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, onAuthStateChanged } from './firebase';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ id: string, message: string, requester: string } | null>(null);

  const openChat = (requestId: string) => {
    setActiveChatRequestId(requestId);
    setCurrentView(ViewState.CHAT);
    setNotification(null);
  };

  // Global State (Transitioning to Firebase)
  const [userStats, setUserStats] = useState<UserStats>({
    massCount: 0,
    rosariesPrayed: 0,
    dailyStreak: 0,
  });

  const [novenas, setNovenas] = useState<Novena[]>([]);

  useEffect(() => {
    // Fail-safe to ensure loading ends even if Firebase hangs
    const timer = setTimeout(() => {
      console.log("[App] Initialization timeout reached. Forcing loading to false.");
      setLoading(false);
    }, 5000);

    // Seeding function (temporary)
    const seedNovenas = async () => {
      try {
        const { getDocs, setDoc, doc, collection } = await import('./firebase');
        const snapshot = await getDocs(collection(db, "novena_catalog"));
        if (snapshot.size < 50) {
          console.log("[App] Seeding/Updating novena catalog (items: " + snapshot.size + ")...");
          const response = await fetch('/novenasData.json');
          const data = await response.json();
          for (const item of data) {
            await setDoc(doc(db, "novena_catalog", item.id), item);
          }
          console.log("[App] Seeding complete.");
        }
      } catch (err) {
        console.error("[App] Seeding error:", err);
      }
    };
    seedNovenas();

    // Safe Auth Listener Wrapper
    const setupAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
          clearTimeout(timer);
          console.log("[App] onAuthStateChanged fired. User:", firebaseUser ? firebaseUser.email : "none");

          if (firebaseUser) {
            setUser(firebaseUser);
            // Setup Listeners Logic...
            try {
              console.log("[App] Setting up Firestore listeners...");
              // User Profile Listener
              const profileUnsub = onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot: any) => {
                if (snapshot.exists()) {
                  const data = snapshot.data();
                  setUserProfile({ ...data, uid: firebaseUser.uid });
                  if (data.stats) setUserStats(data.stats);
                } else {
                  const initialProfile = {
                    name: "Fiel",
                    email: firebaseUser.email,
                    stats: { massCount: 0, rosariesPrayed: 0, dailyStreak: 0 }
                  };
                  setDoc(doc(db, "users", firebaseUser.uid), initialProfile);
                  setUserProfile({ ...initialProfile, uid: firebaseUser.uid });
                }
              });

              // Global Notification Listener for Chat
              const qRequester = query(collection(db, "help_requests"), where("userId", "==", firebaseUser.uid));
              const qPriest = query(collection(db, "help_requests"), where("assistingPriestId", "==", firebaseUser.uid));

              const handleSnap = (snapshot: any) => {
                snapshot.docChanges().forEach((change: any) => {
                  if (change.type === "modified") {
                    const data = change.doc.data();
                    const requestId = change.doc.id;
                    const isPriest = firebaseUser.uid === data.assistingPriestId;
                    const lastRead = isPriest ? data.lastReadAt_priest : data.lastReadAt_requester;

                    if (data.lastMessageAt && data.lastSenderId !== firebaseUser.uid) {
                      if (!lastRead || data.lastMessageAt.seconds > lastRead.seconds) {
                        setNotification({
                          id: requestId,
                          message: data.lastMessageText || "Nova mensagem recebida",
                          requester: data.userName || "Irmão"
                        });
                        setTimeout(() => setNotification(null), 5000);
                      }
                    }
                  }
                });
              };

              const unsubReq = onSnapshot(qRequester, handleSnap);
              const unsubPriest = onSnapshot(qPriest, handleSnap);

              // Active Novenas Listener
              const novenasUnsub = onSnapshot(collection(db, "users", firebaseUser.uid, "novenas"), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Novena[];
                console.log("[App] Active novenas updated:", data.length);
                setNovenas(data);
              });

              // Cleanup previous listeners if any (not implemented here but good practice)
              // For now, these leak if onAuthStateChanged fires multiple times without unmount, 
              // but purely within this effect, we relying on the return cleanup.

            } catch (err) {
              console.error("[App] Error setting up listeners:", err);
            }
          } else {
            console.log("[App] No user, clearing profile.");
            setUser(null);
            setUserProfile(null);
          }
          console.log("[App] Setting loading to false.");
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth init error:", error);
        setLoading(false);
        return () => { };
      }
    };

    let unsubFn: () => void;
    setupAuth().then(fn => unsubFn = fn);

    return () => {
      clearTimeout(timer);
      if (unsubFn) unsubFn();
    };
  }, []);

  const handleUpdateStats = async (newStats: UserStats) => {
    setUserStats(newStats);
    if (user) {
      try {
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
      case ViewState.EXAMEN:
        return <Examen />;
      case ViewState.HELP:
        return <RequestHelp userProfile={userProfile} onOpenChat={openChat} />;
      case ViewState.ASSIST:
        return <AssistBrother userProfile={userProfile} onOpenChat={openChat} />;
      case ViewState.CHAT:
        return activeChatRequestId ? (
          <Chat
            requestId={activeChatRequestId}
            userProfile={userProfile}
            onBack={() => {
              const backView = userProfile?.sacraments?.includes('Ordem') ? ViewState.ASSIST : ViewState.HELP;
              setCurrentView(backView);
            }}
          />
        ) : <Dashboard stats={userStats} updateStats={handleUpdateStats} novenas={novenas} userName={userProfile?.name || 'Fiel'} />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard stats={userStats} updateStats={handleUpdateStats} novenas={novenas} userName={userProfile?.name || 'Fiel'} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest animate-pulse mb-4">Iniciando a Jornada...</p>

          <button
            onClick={() => setLoading(false)}
            className="text-xs text-stone-400 hover:text-gold-500 underline decoration-dotted transition-colors cursor-pointer"
          >
            Demorando muito? Toque aqui para continuar
          </button>
        </div>
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
        userProfile={userProfile}
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
        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] pb-[calc(1rem+env(safe-area-inset-bottom))] relative">
          {renderView()}

          {/* Notification Toast */}
          {notification && currentView !== ViewState.CHAT && (
            <div
              onClick={() => openChat(notification.id)}
              className="fixed bottom-6 right-6 left-6 md:left-auto md:w-80 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 p-4 rounded-2xl shadow-2xl border border-gold-500/30 flex items-center gap-4 cursor-pointer animate-in slide-in-from-bottom-10 duration-500 z-50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-gold-500/20">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold-400 mb-0.5">Nova Mensagem</p>
                <p className="text-sm font-bold truncate">{notification.requester}</p>
                <p className="text-xs opacity-70 truncate italic">"{notification.message}"</p>
              </div>
            </div>
          )}
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