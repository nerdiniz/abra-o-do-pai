import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, User, Phone, MapPin, Handshake, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import { auth, db, collection, query, where, onSnapshot, doc, updateDoc, increment } from '../firebase';

interface HelpRequest {
    id: string;
    userName: string;
    contact: string;
    type: string;
    message: string;
    status: 'pending' | 'assisting' | 'completed';
    city: string;
    timestamp: any;
    assistingPriestId?: string;
    assistingPriestName?: string;
}

interface AssistBrotherProps {
    userProfile?: any;
    onOpenChat: (requestId: string) => void;
}

const AssistBrother: React.FC<AssistBrotherProps> = ({ userProfile, onOpenChat }) => {
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<string>('All');
    const [activeStatus, setActiveStatus] = useState<HelpRequest['status']>('pending');

    const helpTypes = [
        { id: 'All', label: 'Todos' },
        { id: 'Spiritual', label: 'Direção' },
        { id: 'Confession', label: 'Confissão' },
        { id: 'Prayer', label: 'Oração' },
        { id: 'Anointing', label: 'Unção' },
        { id: 'Support', label: 'Auxílio' },
    ];

    const statusFilters = [
        { id: 'pending', label: 'Pendentes' },
        { id: 'assisting', label: 'Em Atendimento' },
        { id: 'completed', label: 'Concluídos' },
    ];

    useEffect(() => {
        let unsubscribe: () => void;

        const fetchRequests = async () => {
            try {
                const userCity = userProfile?.address?.city || '';

                const q = query(
                    collection(db, "help_requests"),
                    where("city", "==", userCity.toUpperCase())
                );

                unsubscribe = onSnapshot(q, (snapshot: any) => {
                    const allData = snapshot.docs.map((doc: any) => ({
                        id: doc.id,
                        ...doc.data()
                    })) as HelpRequest[];

                    setRequests(allData);
                    setLoading(false);
                });
            } catch (err) {
                console.error("Error fetching help requests:", err);
                setLoading(false);
            }
        };

        if (userProfile?.address?.city) {
            fetchRequests();
        } else {
            setLoading(false);
        }

        return () => unsubscribe && unsubscribe();
    }, [userProfile]);

    const filteredRequests = requests.filter(req => {
        const typeMatch = activeType === 'All' || req.type === activeType;
        const statusMatch = req.status === activeStatus;

        // For 'assisting' or 'completed', only show if it was the current priest (privacy/focus)
        if ((activeStatus === 'assisting' || activeStatus === 'completed') && req.assistingPriestId !== userProfile?.uid) {
            return false;
        }

        return typeMatch && statusMatch;
    }).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    const handleAction = async (requestId: string, action: 'claim' | 'complete' | 'cancel') => {
        try {
            const updates: any = {};
            if (action === 'claim') {
                updates.status = 'assisting';
                updates.assistingPriestId = auth.currentUser.uid;
                updates.assistingPriestName = userProfile?.name || 'Padre';
            } else if (action === 'complete') {
                updates.status = 'completed';

                // Update Priest Stats
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    "stats.helpsProvided": increment(1)
                });
            } else if (action === 'cancel') {
                updates.status = 'pending';
                updates.assistingPriestId = null;
                updates.assistingPriestName = null;
            }

            await updateDoc(doc(db, "help_requests", requestId), updates);
        } catch (err) {
            console.error(`Error performing ${action} on request:`, err);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'assisting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-stone-100 text-stone-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'assisting': return 'Em Atendimento';
            case 'completed': return 'Concluído';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userProfile?.address?.city) {
        return (
            <div className="h-full flex items-center justify-center p-8 text-center">
                <Card className="max-w-md p-8 border-dashed border-2 border-stone-200 dark:border-stone-800 bg-transparent shadow-none">
                    <AlertCircle className="mx-auto mb-4 text-stone-400" size={48} />
                    <h3 className="text-xl font-bold text-stone-700 dark:text-stone-300">Cidade não informada</h3>
                    <p className="text-stone-500 mt-2">Para visualizar os pedidos de auxilio da sua região, por favor informe sua cidade nas configurações do perfil.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 animate-in fadeIn duration-700">
            {/* Header */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                            <Handshake className="text-gold-500" /> Auxiliar um Irmão
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-1 italic flex items-center gap-2">
                            <MapPin size={14} className="text-gold-500" />
                            Pedidos em {userProfile.address.city}
                        </p>
                    </div>
                    {userProfile?.stats?.helpsProvided > 0 && (
                        <div className="text-[10px] font-bold text-gold-600 dark:text-gold-500 uppercase tracking-tighter bg-gold-50 dark:bg-gold-900/20 px-2 py-1 rounded-lg border border-gold-200/50">
                            {userProfile.stats.helpsProvided < 5 ? 'Servo da Vinha' :
                                userProfile.stats.helpsProvided < 15 ? 'Irmão Samaritano' :
                                    userProfile.stats.helpsProvided < 30 ? 'Discípulo da Caridade' :
                                        userProfile.stats.helpsProvided < 50 ? 'Guardião da Esperança' : 'Apóstolo do Abraço'}
                            {' • '}{userProfile.stats.helpsProvided} ajudas
                        </div>
                    )}
                </div>

                {/* Sub-Header Tabs & Filters */}
                <div className="space-y-4">
                    {/* Help Type Tabs */}
                    <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-1 bg-stone-100 dark:bg-stone-900/50 p-1 rounded-2xl border border-stone-100 dark:border-stone-800">
                        {helpTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeType === type.id
                                    ? 'bg-white dark:bg-stone-800 text-gold-600 dark:text-gold-400 shadow-sm'
                                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2">
                        {statusFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveStatus(filter.id as any)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeStatus === filter.id
                                    ? 'bg-gold-500 border-gold-500 text-white shadow-lg shadow-gold-500/20'
                                    : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 text-stone-400 hover:border-stone-300'
                                    }`}
                            >
                                {filter.label}
                                <span className="ml-2 opacity-50">
                                    ({requests.filter(r => r.status === filter.id && (activeType === 'All' || r.type === activeType)).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-20 animate-in zoom-in-95">
                    <div className="text-center opacity-40">
                        <MessageSquare className="mx-auto mb-4 text-stone-300 dark:text-stone-700" size={64} />
                        <h3 className="text-lg font-bold text-stone-500 dark:text-stone-400">Nenhum pedido encontrado</h3>
                        <p className="text-stone-400 dark:text-stone-500 text-xs">Tente ajustar seus filtros para encontrar outros irmãos.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredRequests.map(req => (
                        <Card key={req.id} className="relative overflow-hidden border-stone-100 dark:border-stone-800 hover:shadow-xl transition-all flex flex-col group">
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 flex items-center gap-2 z-10`}>
                                {req.lastMessageAt && req.lastSenderId !== userProfile?.uid &&
                                    (!req.lastReadAt_priest || req.lastMessageAt.seconds > req.lastReadAt_priest.seconds) && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
                                    )}
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyles(req.status)}`}>
                                    {getStatusLabel(req.status)}
                                </div>
                            </div>

                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 dark:text-stone-100 leading-none">{req.userName}</h4>
                                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-bold tracking-widest">
                                            {req.type === 'Spiritual' ? 'Direção Espiritual' :
                                                req.type === 'Confession' ? 'Confissão' :
                                                    req.type === 'Prayer' ? 'Oração' :
                                                        req.type === 'Anointing' ? 'Unção' : 'Auxílio'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                        <Phone size={14} className="text-gold-500/50" /> {req.contact}
                                    </div>
                                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed italic border border-stone-100 dark:border-stone-800/50">
                                        "{req.message}"
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-stone-50/50 dark:bg-stone-900/50 border-t border-stone-50 dark:border-stone-800 flex gap-2">
                                {req.status === 'pending' ? (
                                    <Button
                                        className="flex-1 rounded-xl h-10 text-xs font-bold gap-2"
                                        onClick={() => handleAction(req.id, 'claim')}
                                    >
                                        <Handshake size={14} /> Assumir Pedido
                                    </Button>
                                ) : req.status === 'assisting' && (req.assistingPriestId === (userProfile?.uid)) ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl h-10 text-xs font-bold gap-2 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/10"
                                                onClick={() => handleAction(req.id, 'complete')}
                                            >
                                                <CheckCircle size={14} /> Concluir
                                            </Button>
                                            <Button
                                                className="flex-1 rounded-xl h-10 text-xs font-bold gap-2"
                                                onClick={() => onOpenChat(req.id)}
                                            >
                                                <MessageSquare size={14} /> Abrir Chat
                                            </Button>
                                        </div>
                                        <button
                                            onClick={() => handleAction(req.id, 'cancel')}
                                            className="text-[10px] text-red-500/60 hover:text-red-500 font-bold uppercase tracking-widest py-1 transition-colors"
                                        >
                                            Cancelar Atendimento
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 text-center py-2 text-[10px] text-stone-400 italic">
                                        {req.status === 'completed' ? 'Atendimento concluído' : 'Sendo atendido por outro padre'}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssistBrother;
