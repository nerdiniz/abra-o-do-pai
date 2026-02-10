import React, { useState, useEffect } from 'react';
import { Share2, Volume2, Calendar, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface LiturgyData {
  data: string;
  liturgia: string;
  cor: string;
  oracoes: {
    coleta: string;
    oferendas: string;
    comunhao: string;
    extras?: Array<{ titulo: string; texto: string }>;
  };
  leituras: {
    primeiraLeitura: Array<{ referencia: string; titulo: string; texto: string }>;
    salmo: Array<{ referencia: string; refrao: string; texto: string }>;
    segundaLeitura?: Array<{ referencia: string; titulo: string; texto: string }>;
    evangelho: Array<{ referencia: string; titulo: string; texto: string }>;
    extras?: Array<{ tipo: string; referencia: string; titulo: string; texto: string }>;
  };
}

const Liturgy: React.FC = () => {
  const [data, setData] = useState<LiturgyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD

  useEffect(() => {
    const fetchLiturgy = async () => {
      try {
        setLoading(true);
        let url = 'https://liturgia.up.railway.app/v2/';

        if (selectedDate) {
          const [year, month, day] = selectedDate.split('-');
          url += `?dia=${parseInt(day)}&mes=${parseInt(month)}&ano=${year}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar liturgia');
        const json = await response.json();
        setData(json);
        // Set initial tab based on availability
        if (json.leituras.primeiraLeitura.length > 0) setActiveTab('1');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiturgy();
  }, [selectedDate]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
        <p className="text-stone-500 dark:text-stone-400 font-medium">Carregando Liturgia...</p>
      </div>
    );
  }

  const getCorBadge = (cor: string) => {
    const colors: Record<string, string> = {
      'Verde': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      'Vermelho': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      'Roxo': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      'Branco': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700',
      'Rosa': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800'
    };
    const dotColors: Record<string, string> = {
      'Verde': 'bg-green-600 dark:bg-green-500',
      'Vermelho': 'bg-red-600 dark:bg-red-500',
      'Roxo': 'bg-purple-600 dark:bg-purple-500',
      'Branco': 'bg-stone-400 dark:bg-stone-500',
      'Rosa': 'bg-pink-600 dark:bg-pink-500'
    };
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 border ${colors[cor] || colors['Branco']}`}>
        <div className={`w-2 h-2 rounded-full ${dotColors[cor] || dotColors['Branco']}`}></div>
        {cor}
      </div>
    );
  };

  const tabs = data ? [
    { id: '1', label: 'I Leitura', exists: data.leituras.primeiraLeitura.length > 0 },
    { id: 'sl', label: 'Salmo', exists: data.leituras.salmo.length > 0 },
    { id: '2', label: 'II Leitura', exists: !!data.leituras.segundaLeitura && data.leituras.segundaLeitura.length > 0 },
    { id: 'ev', label: 'Evangelho', exists: data.leituras.evangelho.length > 0 },
    { id: 'or', label: 'Orações', exists: true },
  ].filter(t => t.exists) : [];

  const currentReading = () => {
    if (!data) return null;
    switch (activeTab) {
      case '1': return data.leituras.primeiraLeitura[0];
      case 'sl': return data.leituras.salmo[0];
      case '2': return data.leituras.segundaLeitura?.[0];
      case 'ev': return data.leituras.evangelho[0];
      default: return null;
    }
  };

  const reading = currentReading();

  return (
    <div className="pb-12 max-w-2xl mx-auto px-2 md:px-0">
      {/* Date Filter */}
      <div className="flex justify-center md:justify-end mb-4 pt-2">
        <div className="relative w-full max-w-[180px]">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 appearance-none cursor-pointer text-center"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="absolute -top-1.5 -right-1.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] hover:bg-red-100 hover:text-red-500 transition-colors shadow-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && data && (
        <div className="fixed inset-0 bg-white/50 dark:bg-stone-950/50 backdrop-blur-[1px] z-[100] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        </div>
      )}

      {error || !data ? (
        <div className="text-center py-20 px-4">
          <p className="text-red-500 font-medium mb-4">Ops! {error || 'Não foi possível carregar a liturgia.'}</p>
          <Button onClick={() => setSelectedDate('')}>Voltar para Hoje</Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center py-2 md:py-6">
            {getCorBadge(data.cor)}
            <h1 className="font-serif text-sm md:text-5xl text-stone-900 dark:text-stone-100 font-bold mb-2 leading-tight px-1 break-words">
              {data.liturgia}
            </h1>
            <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 text-[10px] md:text-sm">
              <Calendar size={12} className="md:w-4 md:h-4" />
              <span>{data.data}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-0 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur z-20 py-4 border-b border-stone-200 dark:border-stone-800 mb-6 overflow-x-auto scroll-hide">
            <div className="flex justify-start md:justify-center gap-2 px-4 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === tab.id
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <Card className="p-2 py-4 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8 overflow-hidden max-w-full">
            {activeTab === 'or' ? (
              <div className="space-y-10">
                <section>
                  <h3 className="text-gold-600 dark:text-gold-500 font-bold text-sm tracking-widest uppercase mb-4 border-b border-gold-100 dark:border-gold-900/30 pb-2">Oração da Coleta</h3>
                  <p className="font-reading text-lg leading-loose text-stone-800 dark:text-stone-200 italic text-justify">{data.oracoes.coleta}</p>
                </section>
                <section>
                  <h3 className="text-gold-600 dark:text-gold-500 font-bold text-sm tracking-widest uppercase mb-4 border-b border-gold-100 dark:border-gold-900/30 pb-2">Sobre as Oferendas</h3>
                  <p className="font-reading text-lg leading-loose text-stone-800 dark:text-stone-200 italic text-justify">{data.oracoes.oferendas}</p>
                </section>
                <section>
                  <h3 className="text-gold-600 dark:text-gold-500 font-bold text-sm tracking-widest uppercase mb-4 border-b border-gold-100 dark:border-gold-900/30 pb-2">Depois da Comunhão</h3>
                  <p className="font-reading text-lg leading-loose text-stone-800 dark:text-stone-200 italic text-justify">{data.oracoes.comunhao}</p>
                </section>
              </div>
            ) : reading && activeTab !== 'sl' ? (
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <div className="mb-8">
                  <h3 className="text-gold-600 dark:text-gold-500 font-bold text-sm tracking-widest uppercase mb-1">
                    {(reading as any).titulo}
                  </h3>
                  <p className="text-stone-400 dark:text-stone-500 font-bold text-xs">({(reading as any).referencia})</p>
                </div>

                <div className="font-reading text-base md:text-xl leading-relaxed md:leading-loose text-stone-800 dark:text-stone-200 whitespace-pre-wrap text-left md:text-justify overflow-hidden break-words">
                  {/* Dropcap for visual flair - Hidden on small mobile to avoid layout breaks */}
                  <span className="hidden md:block float-left text-6xl font-serif text-gold-500 pr-4 pt-2 font-bold leading-[0.8]">
                    {(reading as any).texto.charAt(0)}
                  </span>
                  <span className="md:hidden font-bold text-gold-500 text-xl mr-1">{(reading as any).texto.charAt(0)}</span>
                  {(reading as any).texto.substring(1)}
                </div>

                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider">
                  <span className="text-gold-600 dark:text-gold-500 text-center">
                    {activeTab === 'ev' ? '— Palavra da Salvação.' : '— Palavra do Senhor.'}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 text-center">
                    {activeTab === 'ev' ? '— Glória a vós, Senhor.' : '— Graças a Deus.'}
                  </span>
                </div>
              </div>
            ) : activeTab === 'sl' && reading ? (
              <div className="text-center">
                <h3 className="text-gold-600 dark:text-gold-500 font-bold text-sm tracking-widest uppercase mb-2">Salmo Responsorial</h3>
                <p className="text-stone-400 dark:text-stone-500 font-bold text-xs mb-8">({(reading as any).referencia})</p>

                <div className="bg-gold-50 dark:bg-gold-900/10 p-5 md:p-8 rounded-2xl border border-gold-100 dark:border-gold-900/50 mb-8 md:mb-10 shadow-inner">
                  <p className="text-xl md:text-2xl font-serif font-bold italic text-gold-700 dark:text-gold-400 leading-snug">
                    — {(reading as any).refrao}
                  </p>
                </div>

                <div className="space-y-6 md:space-y-8 text-stone-700 dark:text-stone-300 font-reading text-base md:text-lg leading-relaxed md:leading-loose italic whitespace-pre-wrap text-justify">
                  {(reading as any).texto}
                </div>
              </div>
            ) : null}
          </Card>
        </>
      )}

    </div>
  );
};

export default Liturgy;