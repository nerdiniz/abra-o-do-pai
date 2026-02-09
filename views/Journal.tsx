import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { PenTool, Heart, Gift, MessageCircle, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Journal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'NOTE' | 'INTENTION' | 'THANKS' | 'REFLECTION'>('NOTE');

  const sections = [
    { id: 'NOTE', label: 'Anotações', icon: PenTool, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { id: 'INTENTION', label: 'Intenções', icon: Heart, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
    { id: 'THANKS', label: 'Ações de Graças', icon: Gift, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { id: 'REFLECTION', label: 'Reflexões', icon: MessageCircle, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  ];

  // No entries by default
  const [entries] = useState<JournalEntry[]>([]);

  const filteredEntries = entries.filter(e => e.type === activeSection);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">

      {/* Sub-Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4 md:mb-6 px-2">Diário Espiritual</h2>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scroll-hide">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl transition-all text-left whitespace-nowrap md:whitespace-normal shrink-0 ${isActive ? 'bg-white dark:bg-stone-900 shadow-md border border-stone-100 dark:border-stone-800' : 'hover:bg-white/50 dark:hover:bg-stone-900/30 text-stone-500 dark:text-stone-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${section.color}`}>
                  <Icon size={16} />
                </div>
                <span className={`font-medium ${isActive ? 'text-stone-800 dark:text-stone-100' : ''}`}>{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            <h3 className="font-bold text-stone-800 dark:text-stone-100">{sections.find(s => s.id === activeSection)?.label}</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500">Suas anotações privadas</p>
          </div>
          <Button size="sm" onClick={() => { }} className="gap-2">
            <Plus size={16} /> Nova Entrada
          </Button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <div key={entry.id} className="group border border-stone-100 dark:border-stone-800 rounded-xl p-5 hover:border-gold-200 dark:hover:border-gold-800 hover:shadow-sm transition-all bg-white dark:bg-stone-900/50 relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gold-600 dark:text-gold-500 bg-gold-50 dark:bg-gold-900/20 px-2 py-1 rounded">{entry.date}</span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-serif">{entry.content}</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-stone-400 dark:text-stone-600 hover:text-gold-600 dark:hover:text-gold-500 text-xs font-bold">Editar</button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-600">
              <PenTool size={48} className="mb-4 opacity-20" />
              <p>Nenhum registro encontrado.</p>
            </div>
          )}
        </div>

        {/* Input Area (Visual) */}
        <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
          <input
            type="text"
            placeholder="Escreva algo novo..."
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400 dark:focus:ring-gold-500/50 transition-all"
          />
        </div>
      </Card>
    </div>
  );
};

export default Journal;