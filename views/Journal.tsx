import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { PenTool, Heart, Gift, MessageCircle, Plus, Trash2, Edit3, Save, X, ChevronRight, Calendar, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { auth, db, collection, query, where, onSnapshot, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from '../firebase';

const Journal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'NOTE' | 'INTENTION' | 'THANKS' | 'REFLECTION'>('NOTE');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { id: 'NOTE', label: 'Anotações', icon: PenTool, color: 'from-blue-500 to-indigo-600', lightColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { id: 'INTENTION', label: 'Intenções', icon: Heart, color: 'from-rose-500 to-pink-600', lightColor: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
    { id: 'THANKS', label: 'Ações de Graças', icon: Gift, color: 'from-amber-500 to-orange-600', lightColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
    { id: 'REFLECTION', label: 'Reflexões', icon: MessageCircle, color: 'from-purple-500 to-fuchsia-600', lightColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  ];

  useEffect(() => {
    let unsubscribe: () => void;

    const setupListener = async () => {
      try {
        if (auth.currentUser) {
          const q = query(
            collection(db, "users", auth.currentUser.uid, "journal"),
            orderBy("timestamp", "desc")
          );

          unsubscribe = onSnapshot(q, (snapshot: any) => {
            const fetchedEntries = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data()
            }));
            setEntries(fetchedEntries);
            setLoading(false);
          });
        }
      } catch (err) {
        console.error("Error setting up journal listener:", err);
        setLoading(false);
      }
    };

    setupListener();
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleAddEntry = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {

      if (auth.currentUser) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        await addDoc(collection(db, "users", auth.currentUser.uid, "journal"), {
          content: newContent,
          type: activeSection,
          date: dateStr,
          timestamp: serverTimestamp()
        });
        setNewContent('');
      }
    } catch (err) {
      console.error("Error adding journal entry:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta entrada?")) return;
    try {

      if (auth.currentUser) {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "journal", id));
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    setSaving(true);
    try {

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid, "journal", editingId), {
          content: editContent
        });
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error updating entry:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter(e =>
    e.type === activeSection &&
    (searchTerm === '' || e.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeInfo = sections.find(s => s.id === activeSection);
  const Icon = activeInfo?.icon || PenTool;

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-full flex flex-col xl:flex-row gap-4 md:gap-6 animate-in fadeIn slide-in-from-bottom-4 duration-700">

      {/* Sidebar Navigation */}
      <div className="w-full xl:w-72 flex flex-col gap-4 shrink-0">
        <div className="px-2">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <PenTool className="text-gold-500" /> Diário
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-widest font-bold">Reflexões da Alma</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-col gap-2 pb-2 xl:pb-0">
          {sections.map(section => {
            const SectionIcon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id as any);
                  setEditingId(null);
                }}
                className={`flex items-center gap-2 p-2 md:p-3 lg:p-4 rounded-2xl transition-all text-left xl:whitespace-normal shrink-0 group relative overflow-hidden ${isActive
                  ? 'bg-white dark:bg-stone-900 shadow-xl shadow-gold-900/5 dark:shadow-black/20 border border-stone-100 dark:border-stone-800'
                  : 'hover:bg-white/50 dark:hover:bg-stone-800/40 text-stone-500 dark:text-stone-400'
                  }`}
              >
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${section.color}`} />
                )}
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${isActive ? `bg-gradient-to-br ${section.color} text-white` : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  }`}>
                  <SectionIcon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className={`font-bold transition-colors ${isActive ? 'text-stone-800 dark:text-stone-100' : 'group-hover:text-stone-700 dark:group-hover:text-stone-200'}`}>
                    {section.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 tabular-nums hidden sm:block">
                      {entries.filter(e => e.type === section.id).length} registros
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0 min-w-0">

        {/* Entries Container */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/50 dark:shadow-none mb-14 md:mb-0">

          {/* Active Section Info (Visible only on empty state or small header) */}
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeInfo?.lightColor}`}>
                <Icon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">{activeInfo?.label}</h3>
              </div>
            </div>
            {loading && <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-hide">
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                <div key={entry.id} className="group relative">
                  {editingId === entry.id ? (
                    <div className="bg-white dark:bg-stone-900 border-2 border-gold-400 rounded-2xl p-4 shadow-lg animate-in zoom-in-95 duration-200">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent text-stone-800 dark:text-stone-100 focus:outline-none min-h-[120px] font-serif leading-relaxed resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-sm font-bold text-stone-400 hover:text-stone-600 transition"
                        >
                          Cancelar
                        </button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="gap-2"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                          Salvar Alteração
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative pl-6 md:pl-8">
                      {/* Timeline visual line */}
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-100 dark:bg-stone-800 group-last:bg-transparent" />
                      <div className="absolute left-[-4px] top-6 w-2 h-2 rounded-full border-2 border-gold-500 bg-white dark:bg-stone-950 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />

                      <div className="bg-stone-50/50 dark:bg-stone-800/20 border border-stone-100 dark:border-stone-800 rounded-3xl p-3 md:p-7 hover:shadow-xl hover:shadow-gold-900/5 dark:hover:shadow-none hover:border-gold-200 dark:hover:border-gold-900/30 transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-black tracking-widest text-gold-600 dark:text-gold-500 bg-gold-50 dark:bg-gold-900/20 px-3 py-1 rounded-full border border-gold-100 dark:border-gold-900/30 tabular-nums">
                              {entry.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(entry)}
                              className="p-2 text-stone-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-serif text-lg">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in fadeIn duration-1000">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center opacity-10 mb-6 bg-gradient-to-br ${activeInfo?.color}`}>
                  <Icon size={48} />
                </div>
                <h4 className="text-stone-400 dark:text-stone-500 font-bold">Nenhum registro em {activeInfo?.label}</h4>
                <p className="text-stone-300 dark:text-stone-600 text-sm mt-1">Sua alma tem silêncio. Comece a escrever.</p>
              </div>
            )}
          </div>

          {/* New Entry Input Container */}
          <div className="p-4 md:p-6 border-t border-stone-100 dark:border-stone-800 bg-gradient-to-t from-stone-50/50 to-transparent dark:from-stone-900/50">
            <div className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${activeInfo?.color} rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-1000 group-hover:duration-200`} />
              <div className="relative flex flex-col gap-3">
                <textarea
                  placeholder={activeSection === 'INTENTION' ? "Qual sua prece hoje?..." : activeSection === 'THANKS' ? "Pelo que você é grato?..." : "Escreva algo novo para sua alma..."}
                  value={newContent}
                  onChange={(e) => {
                    setNewContent(e.target.value);
                    // Auto resize
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl px-4 py-3 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all min-h-[60px] max-h-[200px] resize-none font-serif text-md"
                />
                <div className="flex justify-between items-center px-1 gap-4">
                  <span className="text-[10px] text-stone-400 tracking-wide uppercase font-bold tabular-nums shrink-0">
                    {newContent.length} caracteres
                  </span>
                  <Button
                    onClick={handleAddEntry}
                    disabled={!newContent.trim() || saving}
                    className="flex-1 md:flex-none gap-2 rounded-xl h-10 px-6 shadow-lg shadow-gold-500/20 justify-center"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={18} />}
                    <span className="hidden xs:inline">Registrar</span>
                    <span className="xs:hidden">Salvar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Journal;