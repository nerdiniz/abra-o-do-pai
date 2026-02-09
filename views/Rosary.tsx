import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Music, BookOpen, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { UserStats } from '../types';

interface RosaryProps {
  stats: UserStats;
  updateStats: (newStats: UserStats) => void;
}

interface Mystery {
  id: string;
  set: string;
  order: number;
  title: string;
  reflection: string;
  days: string[];
}

const Rosary: React.FC<RosaryProps> = ({ stats, updateStats }) => {
  const [mysteries, setMysteries] = useState<Mystery[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0); // 0-4
  const [prayerStep, setPrayerStep] = useState<'mystery' | 'parentoster' | 'avemaria' | 'salveregina' | 'finished'>('mystery');
  const [beadCount, setBeadCount] = useState(0); // 0-10 for Ave Maria

  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Map days to Sets
  const getSetByDay = (day: string) => {
    if (day === 'Monday' || day === 'Saturday') return 'Gozosos';
    if (day === 'Tuesday' || day === 'Friday') return 'Dolorosos';
    if (day === 'Wednesday' || day === 'Sunday') return 'Gloriosos';
    if (day === 'Thursday') return 'Luminosos';
    return 'Gozosos';
  };

  const currentSet = getSetByDay(dayOfWeek);

  useEffect(() => {
    const fetchMysteries = async () => {
      setLoading(true);
      try {
        const { auth } = await import("../firebase.js") as any;
        const { collection, getDocs, setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js") as any;
        const { db } = await import("../firebase.js") as any;

        const mysteriesRef = collection(db, "rosary_mysteries");
        const querySnapshot = await getDocs(mysteriesRef);

        console.log(`[Rosary] Total mysteries in collection: ${querySnapshot.size}`);

        let allData = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

        // Robust Seed: If less than 20 mysteries, (re)seed the whole thing
        if (allData.length < 20) {
          console.log("[Rosary] Incomplete database. Seeding/Updating mysteries...");
          const seedData = [
            { set: "Gozosos", order: 1, title: "Anunciação do Anjo a Maria", reflection: "Humildade e aceitação da vontade de Deus", days: ["Monday", "Saturday"] },
            { set: "Gozosos", order: 2, title: "Visitação de Maria a Santa Isabel", reflection: "Caridade e serviço ao próximo", days: ["Monday", "Saturday"] },
            { set: "Gozosos", order: 3, title: "Nascimento de Jesus", reflection: "Simplicidade e pobreza de espírito", days: ["Monday", "Saturday"] },
            { set: "Gozosos", order: 4, title: "Apresentação de Jesus no Templo", reflection: "Obediência e consagração a Deus", days: ["Monday", "Saturday"] },
            { set: "Gozosos", order: 5, title: "Perda e Encontro de Jesus no Templo", reflection: "Busca sincera por Deus acima de tudo", days: ["Monday", "Saturday"] },
            { set: "Luminosos", order: 1, title: "Batismo de Jesus no Jordão", reflection: "Abertura à ação do Espírito Santo", days: ["Thursday"] },
            { set: "Luminosos", order: 2, title: "Bodas de Caná", reflection: "Confiança e intercessão de Maria", days: ["Thursday"] },
            { set: "Luminosos", order: 3, title: "Anúncio do Reino de Deus", reflection: "Conversão e compromisso cristão", days: ["Thursday"] },
            { set: "Luminosos", order: 4, title: "Transfiguração de Jesus", reflection: "Escuta e fidelidade a Cristo", days: ["Thursday"] },
            { set: "Luminosos", order: 5, title: "Instituição da Eucaristia", reflection: "Amor e doação total", days: ["Thursday"] },
            { set: "Dolorosos", order: 1, title: "Agonia de Jesus no Horto", reflection: "Confiança em Deus no sofrimento", days: ["Tuesday", "Friday"] },
            { set: "Dolorosos", order: 2, title: "Flagelação de Jesus", reflection: "Mortificação e purificação", days: ["Tuesday", "Friday"] },
            { set: "Dolorosos", order: 3, title: "Coroação de Espinhos", reflection: "Humildade nas humilhações", days: ["Tuesday", "Friday"] },
            { set: "Dolorosos", order: 4, title: "Jesus carrega a Cruz", reflection: "Perseverança nas provações", days: ["Tuesday", "Friday"] },
            { set: "Dolorosos", order: 5, title: "Crucificação e Morte de Jesus", reflection: "Amor extremo e entrega total", days: ["Tuesday", "Friday"] },
            { set: "Gloriosos", order: 1, title: "Ressurreição de Jesus", reflection: "Fé na vida eterna", days: ["Wednesday", "Sunday"] },
            { set: "Gloriosos", order: 2, title: "Ascensão de Jesus ao Céu", reflection: "Esperança cristã", days: ["Wednesday", "Sunday"] },
            { set: "Gloriosos", order: 3, title: "Vinda do Espírito Santo", reflection: "Zelo apostólico", days: ["Wednesday", "Sunday"] },
            { set: "Gloriosos", order: 4, title: "Assunção de Maria", reflection: "Esperança da ressurreição", days: ["Wednesday", "Sunday"] },
            { set: "Gloriosos", order: 5, title: "Coroação de Maria", reflection: "Confiança na intercessão de Maria", days: ["Wednesday", "Sunday"] }
          ];

          for (const item of seedData) {
            const id = `${item.set.toLowerCase()}_${item.order}`;
            await setDoc(doc(db, "rosary_mysteries", id), item);
          }
          allData = seedData;
        }

        const filtered = allData
          .filter((m: any) => m.set === currentSet)
          .sort((a: any, b: any) => a.order - b.order);

        setMysteries(filtered);

      } catch (err: any) {
        console.error("[Rosary] Error in fetchMysteries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMysteries();
  }, [currentSet]);

  const handleManualSeed = async () => {
    setLoading(true);
    try {
      const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js") as any;
      const { db } = await import("../firebase.js") as any;
      const seedData = [
        { set: "Gozosos", order: 1, title: "Anunciação do Anjo a Maria", reflection: "Humildade e aceitação da vontade de Deus", days: ["Monday", "Saturday"] },
        { set: "Gozosos", order: 2, title: "Visitação de Maria a Santa Isabel", reflection: "Caridade e serviço ao próximo", days: ["Monday", "Saturday"] },
        { set: "Gozosos", order: 3, title: "Nascimento de Jesus", reflection: "Simplicidade e pobreza de espírito", days: ["Monday", "Saturday"] },
        { set: "Gozosos", order: 4, title: "Apresentação de Jesus no Templo", reflection: "Obediência e consagração a Deus", days: ["Monday", "Saturday"] },
        { set: "Gozosos", order: 5, title: "Perda e Encontro de Jesus no Templo", reflection: "Busca sincera por Deus acima de tudo", days: ["Monday", "Saturday"] },
        { set: "Luminosos", order: 1, title: "Batismo de Jesus no Jordão", reflection: "Abertura à ação do Espírito Santo", days: ["Thursday"] },
        { set: "Luminosos", order: 2, title: "Bodas de Caná", reflection: "Confiança e intercessão de Maria", days: ["Thursday"] },
        { set: "Luminosos", order: 3, title: "Anúncio do Reino de Deus", reflection: "Conversão e compromisso cristão", days: ["Thursday"] },
        { set: "Luminosos", order: 4, title: "Transfiguração de Jesus", reflection: "Escuta e fidelidade a Cristo", days: ["Thursday"] },
        { set: "Luminosos", order: 5, title: "Instituição da Eucaristia", reflection: "Amor e doação total", days: ["Thursday"] },
        { set: "Dolorosos", order: 1, title: "Agonia de Jesus no Horto", reflection: "Confiança em Deus no sofrimento", days: ["Tuesday", "Friday"] },
        { set: "Dolorosos", order: 2, title: "Flagelação de Jesus", reflection: "Mortificação e purificação", days: ["Tuesday", "Friday"] },
        { set: "Dolorosos", order: 3, title: "Coroação de Espinhos", reflection: "Humildade nas humilhações", days: ["Tuesday", "Friday"] },
        { set: "Dolorosos", order: 4, title: "Jesus carrega a Cruz", reflection: "Perseverança nas provações", days: ["Tuesday", "Friday"] },
        { set: "Dolorosos", order: 5, title: "Crucificação e Morte de Jesus", reflection: "Amor extremo e entrega total", days: ["Tuesday", "Friday"] },
        { set: "Gloriosos", order: 1, title: "Ressurreição de Jesus", reflection: "Fé na vida eterna", days: ["Wednesday", "Sunday"] },
        { set: "Gloriosos", order: 2, title: "Ascensão de Jesus ao Céu", reflection: "Esperança cristã", days: ["Wednesday", "Sunday"] },
        { set: "Gloriosos", order: 3, title: "Vinda do Espírito Santo", reflection: "Zelo apostólico", days: ["Wednesday", "Sunday"] },
        { set: "Gloriosos", order: 4, title: "Assunção de Maria", reflection: "Esperança da ressurreição", days: ["Wednesday", "Sunday"] },
        { set: "Gloriosos", order: 5, title: "Coroação de Maria", reflection: "Confiança na intercessão de Maria", days: ["Wednesday", "Sunday"] }
      ];

      for (const item of seedData) {
        const id = `${item.set.toLowerCase()}_${item.order}`;
        await setDoc(doc(db, "rosary_mysteries", id), item);
      }
      window.location.reload();
    } catch (err) {
      console.error("Manual seed failed:", err);
      alert("Falha ao configurar os mistérios. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (prayerStep === 'mystery') {
      setPrayerStep('parentoster');
    } else if (prayerStep === 'parentoster') {
      setPrayerStep('avemaria');
      setBeadCount(1);
    } else if (prayerStep === 'avemaria') {
      if (beadCount < 10) {
        setBeadCount(beadCount + 1);
      } else {
        if (currentMysteryIndex < 4) {
          setCurrentMysteryIndex(currentMysteryIndex + 1);
          setPrayerStep('mystery');
          setBeadCount(0);
        } else {
          setPrayerStep('salveregina');
        }
      }
    } else if (prayerStep === 'salveregina') {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (prayerStep === 'avemaria') {
      if (beadCount > 1) {
        setBeadCount(beadCount - 1);
      } else {
        setPrayerStep('parentoster');
      }
    } else if (prayerStep === 'parentoster') {
      setPrayerStep('mystery');
    } else if (prayerStep === 'mystery') {
      if (currentMysteryIndex > 0) {
        setCurrentMysteryIndex(currentMysteryIndex - 1);
        setPrayerStep('avemaria');
        setBeadCount(10);
      }
    } else if (prayerStep === 'salveregina') {
      setPrayerStep('avemaria');
      setBeadCount(10);
    }
  };

  const handleComplete = async () => {
    setPrayerStep('finished');
    const newStats = {
      ...stats,
      rosariesPrayed: (stats.rosariesPrayed || 0) + 1
    };
    updateStats(newStats);
  };

  const resetRosary = () => {
    setCurrentMysteryIndex(0);
    setPrayerStep('mystery');
    setBeadCount(0);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 animate-pulse text-sm font-serif italic">Preparando o altar da oração...</p>
        <button
          onClick={handleManualSeed}
          className="text-[10px] text-stone-400 hover:text-gold-500 underline uppercase tracking-widest mt-8"
        >
          Problemas ao carregar? Clique para configurar novamente.
        </button>
      </div>
    );
  }

  const currentMystery = mysteries[currentMysteryIndex];

  const calculateProgress = () => {
    if (prayerStep === 'finished') return 100;
    const totalSteps = 60; // 5 mysteries * 12 steps (1 mystery + 1 our father + 10 hail marys)

    let currentStep = currentMysteryIndex * 12;
    if (prayerStep === 'mystery') currentStep += 0;
    else if (prayerStep === 'parentoster') currentStep += 1;
    else if (prayerStep === 'avemaria') currentStep += 1 + beadCount;
    else if (prayerStep === 'salveregina') currentStep = 60;

    return Math.min((currentStep / totalSteps) * 100, 100);
  };

  const currentProgress = calculateProgress();

  const prayerTexts = {
    parentoster: {
      title: "Pai Nosso",
      text: "Pai Nosso que estais no céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade assim na terra como no céu..."
    },
    avemaria: {
      title: "Ave Maria",
      text: "Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus..."
    },
    salveregina: {
      title: "Salve Rainha",
      text: "Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos os degredados filhos de Eva..."
    }
  };

  return (
    <div className="h-full flex flex-col items-center max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header Info */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 italic">Mistérios {currentSet}</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Hoje é {dayOfWeek === 'Monday' ? 'Segunda-feira' : dayOfWeek === 'Tuesday' ? 'Terça-feira' : dayOfWeek === 'Wednesday' ? 'Quarta-feira' : dayOfWeek === 'Thursday' ? 'Quinta-feira' : dayOfWeek === 'Friday' ? 'Sexta-feira' : dayOfWeek === 'Saturday' ? 'Sábado' : 'Domingo'}</p>
        </div>
        <div className="flex-1 max-w-xs w-full">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-500">Progresso do Terço</span>
            <span className="text-xs font-mono font-bold text-stone-400">{Math.round(currentProgress)}%</span>
          </div>
          <ProgressBar current={currentProgress} total={100} className="h-2" />
        </div>
        <div className="bg-gold-50 dark:bg-gold-900/20 px-4 py-2 rounded-xl border border-gold-100 dark:border-gold-900/30">
          <span className="block text-[10px] font-bold uppercase text-gold-600 dark:text-gold-400 text-center">Terços Rezados</span>
          <span className="block text-xl font-serif font-bold text-gold-700 dark:text-gold-300 text-center">{stats.rosariesPrayed || 0}</span>
        </div>
      </div>

      {prayerStep === 'finished' ? (
        <Card className="w-full max-w-md p-12 text-center flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-gold-100 dark:bg-gold-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={64} className="text-gold-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100 italic">Terço Concluído!</h2>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-lg">
            Sua oração subiu ao céu como incenso. Que as bênçãos desta meditação acompanhem seu dia.
          </p>
          <Button variant="primary" onClick={resetRosary} className="px-8 py-3">Rezar novamente</Button>
        </Card>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Mystery / Prayer Card */}
          <div className="lg:col-span-12 space-y-6">
            <Card className="p-0 overflow-hidden shadow-2xl border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 min-h-[500px] flex flex-col">

              {/* Card Header (Mystery Info) */}
              <div className="bg-stone-50 dark:bg-stone-850 p-8 border-b border-stone-100 dark:border-stone-800 relative">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-4xl opacity-20">📿</span>
                </div>
                {prayerStep === 'mystery' ? (
                  <div className="text-center animate-in slide-in-from-top duration-500">
                    <span className="inline-block px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4">
                      {currentMysteryIndex + 1}º Mistério
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100 italic mb-4">{currentMystery?.title}</h3>
                    <div className="max-w-2xl mx-auto">
                      <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed italic">
                        "{currentMystery?.reflection}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center animate-in fade-in duration-300">
                    <span className="inline-block px-3 py-1 bg-stone-200 dark:bg-stone-800 text-stone-500 text-[10px] font-bold uppercase tracking-[0.1em] rounded-full mb-2">
                      {currentMysteryIndex + 1}º Mistério em curso
                    </span>
                    <h4 className="text-xl font-serif font-bold text-stone-500 dark:text-stone-400 italic">
                      {currentMystery?.title}
                    </h4>
                  </div>
                )}
              </div>

              {/* Prayer Content */}
              <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center">
                {prayerStep === 'mystery' ? (
                  <div className="space-y-8 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gold-400 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <BookOpen size={32} />
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 max-w-md italic">
                      Medite sobre este mistério por um momento antes de iniciar as orações.
                    </p>
                    <Button onClick={handleNext} variant="primary" className="px-10 py-4 font-serif text-lg">Começar Orações</Button>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
                    <div className="mb-8">
                      <h2 className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500 italic mb-2">
                        {prayerStep === 'avemaria' ? `Ave Maria (${beadCount}/10)` : prayerTexts[prayerStep as keyof typeof prayerTexts].title}
                      </h2>
                      {prayerStep === 'avemaria' && (
                        <div className="flex gap-1.5 justify-center mt-4">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${i < beadCount ? 'bg-gold-500 scale-110 shadow-sm shadow-gold-200' : 'bg-stone-200 dark:bg-stone-800'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-stone-700 dark:text-stone-200 text-2xl font-serif leading-relaxed italic px-4">
                      "{prayerTexts[prayerStep as keyof typeof prayerTexts]?.text}"
                    </p>

                    <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition font-bold uppercase tracking-widest text-[10px] py-3 px-6"
                      >
                        <ChevronLeft size={16} /> Voltar
                      </button>
                      <Button onClick={handleNext} variant="primary" className="px-16 py-4 text-xl font-serif group">
                        {prayerStep === 'avemaria' && beadCount === 10 ? (currentMysteryIndex === 4 ? 'Salve Rainha' : 'Próximo Mistério') : 'Concluir Oração'}
                        <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Guidance / Tips */}
          <div className="lg:col-span-12">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs italic">
                <Music size={14} /> Sugestão: Ouça uma trilha gregoriana suave.
              </div>
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs italic">
                <RefreshCw size={14} /> Você pode reiniciar o terço a qualquer momento.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rosary;