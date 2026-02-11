import React, { useState, useEffect } from 'react';
import { Novena, NovenaCatalog } from '../types';
import { Book, Clock, Info, Heart, Scroll, Search, ChevronRight, X, Sparkles, Trash2, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { db, auth, collection, query, onSnapshot, doc, setDoc, updateDoc, serverTimestamp, getDocs, deleteDoc } from '../firebase';

interface NovenasProps {
   // We already have active novenas from App.tsx props
   novenas: Novena[];
}

const Novenas: React.FC<NovenasProps> = ({ novenas }) => {
   const [catalog, setCatalog] = useState<NovenaCatalog[]>([]);
   const [filter, setFilter] = useState<'Todos' | 'Santos' | 'Maria' | 'Cristo' | 'Espírito Santo'>('Todos');
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedNovena, setSelectedNovena] = useState<NovenaCatalog | null>(null);

   const [selectedActiveNovena, setSelectedActiveNovena] = useState<Novena | null>(null);
   const [showIntentionModal, setShowIntentionModal] = useState(false);
   const [intention, setIntention] = useState('');
   const [loading, setLoading] = useState(true);
   const [starting, setStarting] = useState(false);
   const [updating, setUpdating] = useState(false);

   useEffect(() => {
      const fetchCatalog = async () => {
         try {
            const q = query(collection(db, "novena_catalog"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
               const data = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
               })) as NovenaCatalog[];
               setCatalog(data.sort((a, b) => a.title.localeCompare(b.title)));
               setLoading(false);
            });
            return unsubscribe;
         } catch (err) {
            console.error("Error fetching novena catalog:", err);
            setLoading(false);
         }
      };
      fetchCatalog();
   }, []);

   const filteredCatalog = catalog.filter(item => {
      const matchesFilter = filter === 'Todos' || item.category === filter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
   });

   const activeNovenasMap = new Map(novenas.map(n => [n.catalogId, n]));

   const handleStartNovena = async () => {
      if (!selectedNovena || !auth.currentUser) return;
      setStarting(true);
      try {
         const newNovenaRef = doc(collection(db, "users", auth.currentUser.uid, "novenas"));
         const newNovena: Novena = {
            id: newNovenaRef.id,
            catalogId: selectedNovena.id,
            title: selectedNovena.title,
            image: selectedNovena.image || null,
            currentDay: 1,
            totalDays: selectedNovena.totalDays,
            description: selectedNovena.description,
            intention: intention,
            startedAt: serverTimestamp(),
            lastPrayedAt: null,
            status: 'active'
         };

         await setDoc(newNovenaRef, newNovena);
         setShowIntentionModal(false);
         setSelectedNovena(null);
         setIntention('');
      } catch (err) {
         console.error("Error starting novena:", err);
      } finally {
         setStarting(false);
      }
   };

   const handleToggleDay = async (novena: Novena) => {
      if (!auth.currentUser || updating) return;
      setUpdating(true);
      try {
         const novenaRef = doc(db, "users", auth.currentUser.uid, "novenas", novena.id);
         const nextDay = novena.currentDay + 1;

         if (nextDay > novena.totalDays) {
            await updateDoc(novenaRef, {
               status: 'completed',
               lastPrayedAt: serverTimestamp()
            });
            setSelectedActiveNovena(null);
         } else {
            const updated = {
               currentDay: nextDay,
               lastPrayedAt: serverTimestamp()
            };
            await updateDoc(novenaRef, updated);
            setSelectedActiveNovena({ ...novena, ...updated });
         }
      } catch (err) {
         console.error("Error updating novena:", err);
      } finally {
         setUpdating(false);
      }
   };

   const handleCancelNovena = async (novenaId: string) => {
      if (!auth.currentUser || !window.confirm('Tem certeza que deseja cancelar esta novena?')) return;
      try {
         await deleteDoc(doc(db, "users", auth.currentUser.uid, "novenas", novenaId));
         setSelectedActiveNovena(null);
      } catch (err) {
         console.error("Error canceling novena:", err);
      }
   };

   if (loading) {
      return (
         <div className="h-full flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   return (
      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                  <Book className="text-gold-500" size={28} /> Biblioteca Espiritual
               </h1>
               <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-lg">
                  Escolha uma novena para guiar sua oração. Cada jornada é um caminho de fé e intercessão.
               </p>

            </div>
         </div>

         {/* Stats/Summary Row */}
         {novenas.length > 0 && (
            <section className="bg-gold-50/50 dark:bg-gold-900/5 rounded-3xl p-6 border border-gold-100/50 dark:border-gold-900/20">
               <h2 className="text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold-500 mb-4 flex items-center gap-2">
                  <Sparkles size={16} /> Suas Novenas Ativas
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {novenas.map(novena => (
                     <Card
                        key={novena.id}
                        className="p-4 flex items-center gap-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm cursor-pointer hover:border-gold-300 dark:hover:border-gold-700 transition-all group"
                        onClick={() => setSelectedActiveNovena(novena)}
                     >
                        {novena.image ? (
                           <img src={novena.image} alt={novena.title} className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        ) : (
                           <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                              <Book className="text-stone-400" size={24} />
                           </div>
                        )}
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-stone-800 dark:text-stone-100 truncate">{novena.title}</h4>
                           <div className="mt-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 flex justify-between uppercase">
                              <span>Dia {novena.currentDay}/{novena.totalDays}</span>
                              <span>{Math.round((novena.currentDay / novena.totalDays) * 100)}%</span>
                           </div>
                           <ProgressBar current={novena.currentDay} total={novena.totalDays} className="mt-1 h-1" />
                        </div>
                        <div className="p-2 text-gold-500 bg-gold-50 dark:bg-gold-900/20 rounded-full group-hover:bg-gold-500 group-hover:text-white transition-all">
                           <ChevronRight size={20} />
                        </div>
                     </Card>
                  ))}
               </div>
            </section>
         )}

         {/* Search and Filters */}
         <div className="flex flex-col md:flex-row gap-4 sticky top-0 z-10 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md py-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
               <input
                  type="text"
                  placeholder="Buscar por santo ou devoção..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all dark:text-stone-100"
               />
            </div>
            <div className="flex flex-wrap gap-2 pb-2">
               {['Todos', 'Santos', 'Maria', 'Cristo', 'Espírito Santo'].map((cat) => (
                  <button
                     key={cat}
                     onClick={() => setFilter(cat as any)}
                     className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${filter === cat
                        ? 'bg-gold-400 border-gold-400 text-white shadow-md'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                  >
                     {cat}
                  </button>
               ))}
            </div>
         </div>

         {/* Catalog Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.map((item) => {
               const isActive = activeNovenasMap.has(item.id);
               return (
                  <Card
                     key={item.id}
                     className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-transparent hover:border-gold-200 dark:hover:border-gold-900/50 ${isActive ? 'opacity-75 grayscale-[0.3]' : ''}`}
                     onClick={() => setSelectedNovena(item)}
                  >
                     <div className="relative h-44 overflow-hidden">
                        {item.image ? (
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
                              <Sparkles className="text-gold-500/20" size={48} />
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                           <span className="bg-white/20 backdrop-blur-md text-[10px] text-white px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                              {item.category}
                           </span>
                        </div>
                        {isActive && (
                           <div className="absolute top-4 right-4">
                              <div className="bg-gold-500 text-white p-1.5 rounded-full shadow-lg">
                                 <Heart size={14} fill="white" />
                              </div>
                           </div>
                        )}
                     </div>
                     <div className="p-5">
                        <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-xs mt-2 line-clamp-2 italic leading-relaxed">
                           {item.description}
                        </p>
                        <div className="mt-6 flex items-center justify-between">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                              <Clock size={12} /> {item.totalDays} DIAS
                           </div>
                           <span className="text-xs font-bold text-gold-600 dark:text-gold-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              {isActive ? 'CONTINUAR' : 'EXPLORAR'} <ChevronRight size={14} />
                           </span>
                        </div>
                     </div>
                  </Card>
               );
            })}
         </div>

         {/* Empty State */}
         {filteredCatalog.length === 0 && (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-stone-400" />
               </div>
               <h3 className="text-xl font-serif text-stone-600 dark:text-stone-400 font-bold">Nenhuma novena encontrada</h3>
               <p className="text-stone-400 mt-2">Tente ajustar sua busca ou filtros.</p>
            </div>
         )}

         {/* Detail Modal */}
         {selectedNovena && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
               <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col p-0 rounded-2xl">
                  <div className="relative h-48 md:h-64 flex-shrink-0">
                     {selectedNovena.image ? (
                        <img src={selectedNovena.image} alt={selectedNovena.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center">
                           <Sparkles className="text-white/20 scale-150" size={120} />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
                     <button
                        onClick={() => setSelectedNovena(null)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                     >
                        <X size={20} />
                     </button>
                     <div className="absolute bottom-6 left-8 right-8 text-white">
                        <span className="bg-gold-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-lg">
                           {selectedNovena.category}
                        </span>
                        <h2 className="font-serif text-3xl font-bold">{selectedNovena.title}</h2>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 scroll-hide">
                     <section>
                        <h4 className="text-xs font-bold text-gold-600 dark:text-gold-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                           <Scroll size={14} /> História & Devoção
                        </h4>
                        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed italic border-l-2 border-gold-200/50 dark:border-gold-900/50 pl-4 py-1">
                           {selectedNovena.history}
                        </p>
                     </section>

                     <section>
                        <h4 className="text-xs font-bold text-gold-600 dark:text-gold-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                           <Info size={14} /> Como Rezar
                        </h4>
                        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-4">
                           {selectedNovena.instructions}
                        </p>

                        {selectedNovena.prayerSteps && selectedNovena.prayerSteps.length > 0 && (
                           <div className="space-y-3 mb-6">
                              <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 border-b border-stone-100 dark:border-stone-800 pb-1">Passos da Oração</h5>
                              {selectedNovena.prayerSteps.map((step, idx) => (
                                 <div key={idx} className="flex items-start gap-3 group">
                                    <span className="w-5 h-5 rounded-full bg-gold-50 dark:bg-gold-900/20 text-gold-600 dark:text-gold-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-gold-100 dark:border-gold-900/30 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                       {idx + 1}
                                    </span>
                                    <span className="text-sm text-stone-700 dark:text-stone-300 group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">{step}</span>
                                 </div>
                              ))}
                           </div>
                        )}

                        <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800">
                           <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Oração Principal</h5>
                           <p className="text-sm text-stone-700 dark:text-stone-200 font-serif leading-relaxed italic">
                              "{selectedNovena.defaultPrayer}"
                           </p>
                        </div>
                     </section>
                  </div>

                  <div className="p-6 bg-stone-50 dark:bg-stone-850 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-3">
                     {activeNovenasMap.has(selectedNovena.id) ? (
                        <Button
                           variant="outline"
                           fullWidth
                           onClick={() => setSelectedNovena(null)}
                           className="py-4 font-bold border-gold-400 text-gold-600 dark:text-gold-500"
                        >
                           Ver Progresso Atual
                        </Button>
                     ) : (
                        <Button
                           fullWidth
                           onClick={() => setShowIntentionModal(true)}
                           className="py-4 shadow-xl shadow-gold-400/20 text-lg font-serif"
                        >
                           Iniciar Novena
                        </Button>
                     )}
                     <p className="text-[10px] text-center text-stone-400 uppercase tracking-widest">
                        Duração: {selectedNovena.totalDays} dias de oração
                     </p>
                  </div>
               </Card>
            </div>
         )}

         {/* Intention Modal */}
         {showIntentionModal && selectedNovena && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md animate-in zoom-in duration-300">
               <Card className="w-full max-w-md p-6 md:p-8 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto rounded-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold-400" />
                  <div className="w-16 h-16 bg-gold-50 dark:bg-gold-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Sparkles className="text-gold-500" size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 font-italic">Sua Intenção</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                     Pela qual graça você deseja interceder nesta novena a <strong>{selectedNovena.title}</strong>?
                  </p>
                  <textarea
                     value={intention}
                     onChange={(e) => setIntention(e.target.value)}
                     placeholder="Escreva sua intenção pessoal..."
                     className="w-full h-32 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all resize-none mb-6 dark:text-stone-100"
                     autoFocus
                  />
                  <div className="flex gap-3">
                     <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setShowIntentionModal(false)}
                        disabled={starting}
                     >
                        Cancelar
                     </Button>
                     <Button
                        fullWidth
                        onClick={handleStartNovena}
                        disabled={!intention.trim() || starting}
                     >
                        {starting ? 'Iniciando...' : 'Confirmar'}
                     </Button>
                  </div>
               </Card>
            </div>
         )}

         {/* Active Novena Management Modal */}
         {selectedActiveNovena && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-300">
               <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col rounded-2xl">
                  <div className="h-32 md:h-40 relative flex-shrink-0">
                     {selectedActiveNovena.image ? (
                        <img src={selectedActiveNovena.image} alt={selectedActiveNovena.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                           <Book className="text-white/10 scale-150" size={80} />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                     <button
                        onClick={() => setSelectedActiveNovena(null)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                     >
                        <X size={20} />
                     </button>
                     <div className="absolute bottom-4 left-6">
                        <h3 className="font-serif text-2xl font-bold text-white uppercase tracking-tight">{selectedActiveNovena.title}</h3>
                        <p className="text-stone-300 text-xs mt-1">Sua jornada de {selectedActiveNovena.totalDays} dias</p>
                     </div>
                  </div>

                  <div className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                     <div className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-bold text-gold-600 dark:text-gold-500 uppercase tracking-widest">Progresso da Novena</span>
                           <span className="text-sm font-serif font-bold dark:text-stone-100">Dia {selectedActiveNovena.currentDay} de {selectedActiveNovena.totalDays}</span>
                        </div>
                        <ProgressBar current={selectedActiveNovena.currentDay} total={selectedActiveNovena.totalDays} className="h-2" />
                     </div>

                     {selectedActiveNovena.intention && (
                        <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                           <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Heart size={12} className="text-gold-500" /> Sua Intenção Pessoal
                           </h4>
                           <p className="text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed">
                              "{selectedActiveNovena.intention}"
                           </p>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gold-50/50 dark:bg-gold-900/5 rounded-2xl border border-gold-100 dark:border-gold-900/20">
                           <p className="text-[10px] text-gold-600 dark:text-gold-500 font-bold uppercase mb-1">Iniciada em</p>
                           <p className="text-sm font-bold dark:text-white">
                              {selectedActiveNovena.startedAt?.toDate ? selectedActiveNovena.startedAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                           </p>
                        </div>
                        <div className="p-4 bg-gold-50/50 dark:bg-gold-900/5 rounded-2xl border border-gold-100 dark:border-gold-900/20">
                           <p className="text-[10px] text-gold-600 dark:text-gold-500 font-bold uppercase mb-1">Última Oração</p>
                           <p className="text-sm font-bold dark:text-white">
                              {selectedActiveNovena.lastPrayedAt?.toDate ? selectedActiveNovena.lastPrayedAt.toDate().toLocaleDateString('pt-BR') : 'Hoje'}
                           </p>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 pt-4">
                        <Button
                           fullWidth
                           onClick={() => handleToggleDay(selectedActiveNovena)}
                           disabled={updating}
                           className="py-4 shadow-xl shadow-gold-400/20 text-lg font-serif flex items-center justify-center gap-2"
                        >
                           {updating ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           ) : (
                              <>
                                 <CheckCircle size={20} />
                                 Marcar Dia {selectedActiveNovena.currentDay} como Concluído
                              </>
                           )}
                        </Button>
                        <Button
                           variant="outline"
                           fullWidth
                           onClick={() => handleCancelNovena(selectedActiveNovena.id)}
                           className="py-3 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2"
                        >
                           <Trash2 size={18} /> Cancelar Novena
                        </Button>
                     </div>
                  </div>
               </Card>
            </div>
         )}
      </div>
   );
};

export default Novenas;