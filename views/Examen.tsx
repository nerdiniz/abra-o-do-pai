import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, Sparkles, Heart, HelpCircle, ShieldAlert, BookOpen, PenTool } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Examen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'COMMANDMENTS' | 'SINS'>('SINS');
    const [sinNotes, setSinNotes] = useState<Record<string, string>>({});

    const handleNoteChange = (sin: string, value: string) => {
        setSinNotes(prev => ({ ...prev, [sin]: value }));
    };

    const commandments = [
        { title: "1º Amar a Deus sobre todas as coisas", questions: ["Dei a Deus o primeiro lugar na minha vida?", "Duvidei da fé ou negligenciei minhas orações?"] },
        { title: "2º Não tomar seu santo nome em vão", questions: ["Usei o nome de Deus sem respeito?", "Fiz juramentos falsos ou blasfemei?"] },
        { title: "3º Guardar domingos e festas", questions: ["Faltei à Missa aos domingos por culpa própria?", "Trabalhei desnecessariamente no dia do Senhor?"] },
        { title: "4º Honrar pai e mãe", questions: ["Fui desobediente ou desrespeitoso com meus pais?", "Negligenciei o cuidado com minha família?"] },
        { title: "5º Não matar", questions: ["Tive ódio, raiva ou desejo de vingança?", "Prejudiquei minha saúde ou a de outros?"] },
        { title: "6º e 9º Pureza e Castidade", questions: ["Tive pensamentos ou atos impuros?", "Respeitei a dignidade do meu corpo e do próximo?"] },
        { title: "7º e 10º Não roubar e não cobiçar", questions: ["Peguei algo que não era meu?", "Tive inveja dos bens ou sucessos alheios?"] },
        { title: "8º Não levantar falso testemunho", questions: ["Menti ou caluniei alguém?", "Revelei segredos ou fofoquei?"] }
    ];

    const capitalSins = [
        { name: "Soberba", description: "O orgulho excessivo e a busca por glória própria." },
        { name: "Avareza", description: "O apego excessivo aos bens materiais." },
        { name: "Luxúria", description: "A busca desordenada pelo prazer carnal." },
        { name: "Ira", description: "O desejo descontrolado de vingança ou raiva." },
        { name: "Gula", description: "O consumo excessivo de alimentos ou bebidas." },
        { name: "Inveja", description: "O pesar pelo bem/sucesso do próximo." },
        { name: "Preguiça", description: "A negligência no cumprimento dos deveres espirituais." }
    ];

    return (
        <div className="h-full flex flex-col gap-8 animate-in fadeIn duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                        <Scale className="text-gold-500" /> Exame de Consciência
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-1 italic">"Conhece-te a ti mesmo e conhecerás a Deus."</p>
                </div>
                <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
                    <button
                        onClick={() => setActiveTab('SINS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SINS' ? 'bg-white dark:bg-stone-800 shadow-sm text-gold-600 dark:text-gold-500' : 'text-stone-500'}`}
                    >
                        Pecados Capitais
                    </button>
                    <button
                        onClick={() => setActiveTab('COMMANDMENTS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'COMMANDMENTS' ? 'bg-white dark:bg-stone-800 shadow-sm text-gold-600 dark:text-gold-500' : 'text-stone-500'}`}
                    >
                        Mandamentos
                    </button>
                </div>
            </div>

            {/* Prayers / Prep Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 md:p-8 border-none bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-gold-500">
                        <Sparkles size={120} />
                    </div>

                    <div className="relative space-y-6">
                        <div className="flex items-center gap-3 text-gold-600 dark:text-gold-500 font-bold uppercase tracking-widest text-xs">
                            <ShieldAlert size={16} /> Oração Inicial
                        </div>
                        <p className="text-lg md:text-xl font-serif leading-relaxed text-stone-700 dark:text-stone-300 italic">
                            "Vinde, Espírito Santo, iluminai a minha inteligência para que eu conheça os meus pecados; tocai o meu coração para que eu deles me arrependa e os confesse como se deve. Amém."
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-gold-500 text-white border-none shadow-gold-500/20 shadow-xl flex flex-col justify-center items-center text-center">
                    <Heart className="mb-4 animate-pulse" size={40} />
                    <h4 className="font-bold text-xl mb-2">Ato de Contrição</h4>
                    <p className="text-sm opacity-95 leading-relaxed font-serif">
                        "Meu Deus, porque sois infinitamente bom e Vos amo de todo o meu coração, pesa-me de Vos ter ofendido e, com o auxílio da Vossa divina graça, proponho firmemente emendar-me e nunca mais Vos tornar a ofender. Peço e espero o perdão das minhas culpas pela Vossa infinita misericórdia. Ámen."
                    </p>
                </Card>
            </div>

            {/* Guided Section */}
            <div className="space-y-6 pb-12">
                {activeTab === 'COMMANDMENTS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commandments.map((c, i) => (
                            <div key={i} className="bg-white dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 p-5 rounded-2xl hover:border-gold-300 dark:hover:border-gold-800 transition-all group">
                                <h5 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-600 dark:text-gold-500 flex items-center justify-center text-[10px] tabular-nums">
                                        {i + 1}
                                    </div>
                                    {c.title}
                                </h5>
                                <ul className="space-y-2">
                                    {c.questions.map((q, qIndex) => (
                                        <li key={qIndex} className="flex gap-2 text-sm text-stone-500 dark:text-stone-400 font-serif leading-relaxed">
                                            <HelpCircle size={14} className="shrink-0 mt-1 opacity-40 group-hover:text-gold-500 group-hover:opacity-100 transition-all" />
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {capitalSins.map((s, i) => (
                            <Card key={i} className="p-5 border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm group hover:border-gold-300 dark:hover:border-gold-900/50 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-gold-50 dark:bg-gold-900/20 rounded-xl flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider text-sm">{s.name}</h5>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-black">{s.description}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <PenTool className="absolute right-3 top-3 text-stone-300 dark:text-stone-700" size={14} />
                                    <textarea
                                        value={sinNotes[s.name] || ''}
                                        onChange={(e) => handleNoteChange(s.name, e.target.value)}
                                        placeholder={`Anotações sobre ${s.name.toLowerCase()}...`}
                                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-3 text-sm text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-400/30 min-h-[80px] font-serif resize-none"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex flex-col items-center justify-center pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
                    <div className="w-16 h-16 bg-gold-50 dark:bg-gold-900/20 rounded-full flex items-center justify-center text-gold-600 dark:text-gold-500 mb-4 animate-bounce">
                        <CheckCircle2 size={32} />
                    </div>
                    <h4 className="font-bold text-stone-700 dark:text-stone-300">Pronto para a Confissão?</h4>
                    <p className="text-sm text-stone-400 mt-1 max-w-sm">Reze pedindo a graça de uma boa e santa confissão. Lembre-se: Deus te espera com misericórdia infinita.</p>
                    <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center gap-3 text-left max-w-md">
                        <BookOpen className="text-gold-500 shrink-0" size={20} />
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                            Dica: Estas anotações são temporárias para te ajudar a organizar os pensamentos. Não são salvas permanentemente por privacidade.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Examen;
