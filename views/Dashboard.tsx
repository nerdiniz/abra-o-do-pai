import React, { useState } from 'react';
import { UserStats, Novena } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, Circle, ChevronRight, Play, Minus, Plus, Clock, X, Flame } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import CircularProgress from '../components/ui/CircularProgress';
import { auth, db, doc, getDoc, updateDoc, serverTimestamp } from '../firebase';

interface CandleData {
  id: string;
  intention: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface DashboardProps {
  stats: UserStats;
  updateStats: (newStats: UserStats) => void;
  novenas: Novena[];
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, updateStats, novenas, userName }) => {
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; subtitle: string; completed: boolean; type?: 'novena' | 'rosary'; originalNovena?: Novena }>>([]);
  const [psalm, setPsalm] = useState<{ reference: string; text: string } | null>(null);
  const [loadingPsalm, setLoadingPsalm] = useState(true);
  const [activeCandle, setActiveCandle] = useState<CandleData | null>(null);
  const [showCandleModal, setShowCandleModal] = useState(false);
  const [candleIntention, setCandleIntention] = useState('');
  const [candleHours, setCandleHours] = useState(24);
  const [timeLeft, setTimeLeft] = useState('');
  const [savingCandle, setSavingCandle] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isToday = (firebaseDate: any) => {
    if (!firebaseDate) return false;
    try {
      // Handle both Firestore Timestamp and JS Date/ISO string
      const date = firebaseDate.toDate ? firebaseDate.toDate() : new Date(firebaseDate);
      return date.toDateString() === new Date().toDateString();
    } catch (err) {
      return false;
    }
  };

  // Sync Candle from Firestore
  React.useEffect(() => {
    const fetchCandle = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.activeCandle) {
              const now = new Date();
              const end = new Date(data.activeCandle.endDate);
              if (end > now) {
                setActiveCandle(data.activeCandle);
              } else {
                setActiveCandle(null);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching candle:", err);
      }
    };
    fetchCandle();
  }, []);

  // Countdown logic
  React.useEffect(() => {
    if (!activeCandle) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeCandle.endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setActiveCandle(null);
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCandle]);

  const handleLightCandle = async () => {
    if (!candleIntention.trim()) return;
    setSavingCandle(true);
    try {
      if (auth.currentUser) {
        const start = new Date();
        const end = new Date(start.getTime() + candleHours * 60 * 60 * 1000);

        const newCandle = {
          id: Date.now().toString(),
          intention: candleIntention,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          isActive: true
        };

        await updateDoc(doc(db, "users", auth.currentUser.uid), { activeCandle: newCandle });
        setActiveCandle(newCandle);
        setShowCandleModal(false);
        setCandleIntention('');
      }
    } catch (err) {
      console.error("Error lighting candle:", err);
      alert("Erro ao acender a vela.");
    } finally {
      setSavingCandle(false);
    }
  };

  const handleExtinguishCandle = async () => {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { activeCandle: null });
        setActiveCandle(null);
      }
    } catch (err) {
      console.error("Error extinguishing candle:", err);
    }
  };

  React.useEffect(() => {
    const fetchPsalm = async () => {
      try {
        const response = await fetch('https://liturgia.up.railway.app/v2/');
        const data = await response.json();
        if (data && data.salmo) {
          setPsalm({
            reference: data.salmo.referencia,
            text: data.salmo.texto
          });
        }
      } catch (err) {
        console.error("Error fetching psalm:", err);
      } finally {
        setLoadingPsalm(false);
      }
    };
    fetchPsalm();
  }, []);

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return; // Only allow completing

    // Implementation logic for different types
    if (task.type === 'novena' && task.originalNovena && auth.currentUser) {
      const novena = task.originalNovena;
      if (novena.currentDay < novena.totalDays) {
        const ref = doc(db, "users", auth.currentUser.uid, "novenas", novena.id);
        await updateDoc(ref, {
          currentDay: novena.currentDay + 1,
          lastPrayedAt: serverTimestamp()
        });
      }
    } else if (task.type === 'rosary') {
      updateStats({
        ...stats,
        rosariesPrayed: (stats.rosariesPrayed || 0) + 1,
        lastRosaryAt: serverTimestamp()
      });
    }

    // Refresh tasks locally immediately for better UX
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  const incrementMass = () => updateStats({ ...stats, massCount: (stats.massCount || 0) + 1 });
  const decrementMass = () => updateStats({ ...stats, massCount: Math.max(0, (stats.massCount || 0) - 1) });

  const completedTasks = tasks.length > 0 ? tasks.filter(t => t.completed).length : 0;
  const progressData = [
    { name: 'Concluído', value: completedTasks },
    { name: 'Pendente', value: tasks.length > 0 ? tasks.length - completedTasks : 1 }, // Show 1 for pending if empty to avoid chart errors
  ];
  /* Removed Recharts Colors */

  // Effect to sync dynamic tasks
  React.useEffect(() => {
    const dynamicTasks = [];

    // Add Rosary if toggled
    if (stats.rosaryFixedTask) {
      const mysteriesMap: Record<string, string> = {
        'Segunda-feira': 'Gozosos',
        'Terça-feira': 'Dolorosos',
        'Quarta-feira': 'Gloriosos',
        'Quinta-feira': 'Luminosos',
        'Sexta-feira': 'Dolorosos',
        'Sábado': 'Gozosos',
        'Domingo': 'Gloriosos'
      };
      const todayPt = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
      const currentMysterySet = mysteriesMap[todayPt.charAt(0).toUpperCase() + todayPt.slice(1)] || 'Gozosos';

      dynamicTasks.push({
        id: 'rosary-task',
        title: 'Rezar o Santo Terço',
        subtitle: `Mistérios ${currentMysterySet}`,
        completed: isToday(stats.lastRosaryAt),
        type: 'rosary'
      });
    }

    // Add Active Novenas
    novenas.filter(n => n.status === 'active').forEach(n => {
      dynamicTasks.push({
        id: `novena-${n.id}`,
        title: `Novena: ${n.title}`,
        subtitle: `Dia ${n.currentDay} de ${n.totalDays}`,
        completed: isToday(n.lastPrayedAt),
        type: 'novena',
        originalNovena: n
      });
    });

    setTasks(dynamicTasks as any);
  }, [novenas, stats.rosaryFixedTask, stats.lastRosaryAt]);

  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="md:max-w-md">
          <h1 className="font-serif text-2xl md:text-4xl text-stone-800 dark:text-stone-100 font-bold italic">Salve Maria, {userName}</h1>
          <p className="text-stone-500 dark:text-stone-400 capitalize mt-1 md:mt-2 font-sans text-sm md:text-base">{date}</p>
        </div>
        {!loadingPsalm && psalm && (
          <Card className="p-4 md:p-5 border-l-4 border-l-gold-400 max-w-full md:max-w-md italic text-stone-600 dark:text-stone-400 text-sm md:text-base">
            "{psalm.text.length > 150 ? psalm.text.substring(0, 150) + '...' : psalm.text}"
            <span className="block text-right text-xs md:text-sm font-bold text-gold-600 dark:text-gold-500 mt-2 not-italic">— {psalm.reference}</span>
          </Card>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Progress */}
            <Card className="p-6 flex items-center gap-6">
              <div className="w-24 h-24 relative flex-shrink-0">
                <CircularProgress
                  value={(completedTasks / tasks.length) * 100}
                  size={96}
                  strokeWidth={8}
                  trackColor="stroke-stone-200 dark:stroke-stone-800"
                  progressColor="stroke-gold-400"
                  textColor="text-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">Progresso Diário</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Sua jornada de oração hoje.</p>
              </div>
            </Card>

            {/* Mass Counter */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">Contador de Missas</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Participações este ano</p>
              </div>
              <div className="flex items-center justify-end gap-4 mt-4">
                <button
                  onClick={decrementMass}
                  className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 transition text-stone-500 dark:text-stone-400"
                >
                  <Minus size={18} />
                </button>
                <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.massCount}</span>
                <button
                  onClick={incrementMass}
                  className="w-10 h-10 rounded-full bg-gold-400 text-white flex items-center justify-center hover:bg-gold-500 shadow-md transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </Card>
          </div>

          {/* Active Novenas */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-serif text-stone-800 dark:text-stone-100 flex items-center gap-2">
                Novenas Ativas
              </h2>
              <button className="text-gold-600 dark:text-gold-500 text-sm font-semibold hover:underline">Ver todas</button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scroll-hide min-h-[100px] items-center">
              {novenas.length > 0 ? novenas.slice(0, 3).map(novena => (
                <Card key={novena.id} className="min-w-[280px] p-5 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <img src={novena.image} alt={novena.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-800 dark:text-stone-100 truncate">{novena.title}</h4>
                        <p className="text-[10px] text-gold-600 dark:text-gold-500 font-bold uppercase tracking-widest">
                          Dia {novena.currentDay} de {novena.totalDays}
                        </p>
                      </div>
                    </div>
                    {novena.intention && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic mb-4 line-clamp-2 leading-relaxed">
                        "{novena.intention}"
                      </p>
                    )}
                    <ProgressBar current={novena.currentDay} total={novena.totalDays} className="mb-4 h-1.5" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={async () => {
                        if (auth.currentUser && novena.currentDay < novena.totalDays) {
                          const ref = doc(db, "users", auth.currentUser.uid, "novenas", novena.id);
                          await updateDoc(ref, {
                            currentDay: novena.currentDay + 1,
                            lastPrayedAt: serverTimestamp()
                          });
                        }
                      }}
                      className="text-[10px] font-bold text-gold-600 dark:text-gold-500 hover:text-gold-700 uppercase tracking-widest flex items-center gap-1 group/btn"
                    >
                      <Play size={12} className="fill-current" /> Rezar Dia {novena.currentDay}
                    </button>
                    <span className="text-[10px] text-stone-400 font-bold">
                      {Math.round((novena.currentDay / novena.totalDays) * 100)}%
                    </span>
                  </div>
                </Card>
              )) : (
                <div className="bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-8 w-full text-center">
                  <p className="text-stone-400 dark:text-stone-500 text-sm italic">Nenhuma novena em andamento.</p>
                </div>
              )}
            </div>
          </section>

          {/* Daily Tasks */}
          <section>
            <Card className="p-8">
              <h2 className="text-xl font-bold font-serif text-stone-800 dark:text-stone-100 mb-6">Compromissos do Dia</h2>
              <div className="space-y-4">
                {tasks.length > 0 ? tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${task.completed
                      ? 'bg-gold-50/50 dark:bg-gold-900/10 border-gold-100 dark:border-gold-800'
                      : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-gold-200 dark:hover:border-gold-700'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {task.completed
                        ? <CheckCircle className="text-gold-500" size={24} />
                        : <Circle className="text-stone-300 dark:text-stone-700" size={24} />
                      }
                      <div>
                        <span className={`font-bold block ${task.completed ? 'text-stone-400 dark:text-stone-600 line-through' : 'text-stone-800 dark:text-stone-100'}`}>{task.title}</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">{task.subtitle}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-stone-400 dark:text-stone-600">
                    <p className="italic">Nenhum compromisso agendado para hoje.</p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6">
            {activeCandle ? (
              <Card className="p-0 overflow-hidden hover:shadow-lg transition-all border-2 border-gold-200 dark:border-gold-900/50 flex flex-col">
                <div className="bg-stone-50 dark:bg-stone-850 flex flex-col items-center justify-center p-8 border-b border-stone-100 dark:border-stone-800 relative overflow-hidden h-48">
                  <div className="absolute inset-0 bg-gold-400/5 animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <span className="block text-7xl mb-4 animate-bounce duration-[2000ms]">🕯️</span>
                    <div className="flex items-center gap-1.5 justify-center">
                      <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-500">Vela Acesa</span>
                    </div>
                  </div>
                  <button
                    onClick={handleExtinguishCandle}
                    className="absolute top-4 right-4 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition text-stone-400 hover:text-red-500 z-20"
                    title="Apagar Vela"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-8 flex-1 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Sua Intenção</h4>
                    <p className="text-stone-800 dark:text-stone-100 text-base font-medium text-justify break-words leading-relaxed px-2 italic">
                      "{activeCandle.intention}"
                    </p>
                  </div>
                  <div className="pt-6 border-t border-stone-50 dark:border-stone-800">
                    <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
                      <Clock size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Tempo Restante de Oração</span>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-3xl font-bold text-gold-600 dark:text-gold-500 tabular-nums">
                        {timeLeft || '00h 00m 00s'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                className="p-10 hover:shadow-xl transition-all text-center cursor-pointer group border-2 border-transparent hover:border-gold-200 min-h-[300px] flex flex-col items-center justify-center bg-white dark:bg-stone-900"
                onClick={() => setShowCandleModal(true)}
              >
                <div className="w-24 h-24 bg-gold-50 dark:bg-gold-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-gold-100 dark:border-gold-900/30">
                  <span className="text-6xl">🕯️</span>
                </div>
                <span className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 italic text-center">Acender uma Vela</span>
                <p className="text-stone-500 mt-4 max-w-xs mx-auto text-lg text-center font-sans leading-relaxed">Coloque suas intenções diante do Senhor e mantenha sua fé brilhando.</p>
                <div className="mt-8 px-8 py-3 bg-gold-400 hover:bg-gold-500 text-white rounded-full font-bold shadow-md transition-all">
                  Nova Intenção
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Candle Modal */}
      {showCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl border-gold-200/50 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
              <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <Flame size={20} className="text-gold-500" /> Acender uma Vela
              </h3>
              <button onClick={() => setShowCandleModal(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">Sua Intenção (máx. 100 letras)</label>
                <textarea
                  value={candleIntention}
                  onChange={(e) => setCandleIntention(e.target.value.substring(0, 100))}
                  className="w-full h-24 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all resize-none"
                  placeholder="Pela minha família, saúde, trabalho..."
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] font-bold ${candleIntention.length >= 100 ? 'text-red-500' : 'text-stone-400'}`}>
                    {candleIntention.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-3">Tempo de Oração</label>
                <div className="grid grid-cols-3 gap-3">
                  {[24, 48, 72].map(hours => (
                    <button
                      key={hours}
                      onClick={() => setCandleHours(hours)}
                      className={`py-3 rounded-xl border font-bold text-sm transition-all ${candleHours === hours
                        ? 'bg-gold-400 border-gold-400 text-white shadow-md'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'}`}
                    >
                      {hours} Horas
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-2 italic text-center">A vela brilhará simbolicamente no seu dashboard por este período.</p>
              </div>

              <Button
                variant="primary"
                fullWidth
                className="py-4 text-lg font-serif"
                onClick={handleLightCandle}
                disabled={!candleIntention.trim() || savingCandle}
              >
                {savingCandle ? 'Acendendo...' : 'Acender Vela'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;