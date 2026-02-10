import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, Handshake, AlertCircle, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import { auth, db, collection, query, where, onSnapshot } from '../firebase';

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
    lastMessageAt?: any;
    lastSenderId?: string;
    lastReadAt_requester?: any;
    lastReadAt_priest?: any;
}

interface MyRequestsProps {
    userProfile?: any;
    onOpenChat: (requestId: string) => void;
}

const MyRequests: React.FC<MyRequestsProps> = ({ userProfile, onOpenChat }) => {
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;

        const fetchMyRequests = async () => {
            try {
                if (!auth.currentUser) return;

                const q = query(
                    collection(db, "help_requests"),
                    where("userId", "==", auth.currentUser.uid)
                );

                unsubscribe = onSnapshot(q, (snapshot: any) => {
                    const fetched = snapshot.docs.map((doc: any) => ({
                        id: doc.id,
                        ...doc.data()
                    })) as HelpRequest[];

                    setRequests(fetched.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
                    setLoading(false);
                });
            } catch (err) {
                console.error("Error fetching my requests:", err);
                setLoading(false);
            }
        };

        fetchMyRequests();
        return () => unsubscribe && unsubscribe();
    }, [userProfile]);

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
            case 'pending': return 'Aguardando Sacerdote';
            case 'assisting': return 'Em Atendimento';
            case 'completed': return 'Finalizado';
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

    return (
        <div className="h-full flex flex-col gap-8 animate-in fadeIn duration-700">
            <div>
                <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                    <Clock className="text-gold-500" /> Meus Pedidos
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1 italic">Acompanhe o status das suas solicitações de auxílio espiritual.</p>
            </div>

            {requests.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-20">
                    <Card className="max-w-md w-full p-8 text-center border-dashed border-2 border-stone-200 dark:border-stone-800 bg-transparent shadow-none">
                        <AlertCircle className="mx-auto mb-4 text-stone-400" size={48} />
                        <h3 className="text-xl font-bold text-stone-700 dark:text-stone-300">Nenhum pedido feito</h3>
                        <p className="text-stone-500 mt-2">Você ainda não realizou nenhum pedido de auxílio espiritual.</p>
                    </Card>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <Card key={req.id} className="p-0 overflow-hidden border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row items-stretch">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {req.lastMessageAt && req.lastSenderId !== userProfile?.uid &&
                                                (!req.lastReadAt_requester || req.lastMessageAt.seconds > req.lastReadAt_requester.seconds) && (
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
                                                )}
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyles(req.status)}`}>
                                                {getStatusLabel(req.status)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                            {req.timestamp ? new Date(req.timestamp?.seconds * 1000).toLocaleDateString('pt-BR') : '...'}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-1">
                                        {req.type === 'Spiritual' ? 'Direção Espiritual' :
                                            req.type === 'Confession' ? 'Pedido de Confissão' :
                                                req.type === 'Prayer' ? 'Pedido de Oração' :
                                                    req.type === 'Anointing' ? 'Unção dos Enfermos' : 'Auxílio em Dificuldades'}
                                    </h4>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 font-serif italic line-clamp-2">"{req.message}"</p>

                                    {req.assistingPriestName && (
                                        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-stone-50 dark:border-stone-800/50">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                                <Handshake size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-stone-400 uppercase font-bold leading-none mb-1">Atendido por</p>
                                                <p className="text-sm font-bold text-stone-700 dark:text-stone-300 leading-none">{req.assistingPriestName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {req.status === 'assisting' && (
                                    <button
                                        onClick={() => onOpenChat(req.id)}
                                        className="bg-gold-400 hover:bg-gold-500 text-white p-6 flex flex-col items-center justify-center gap-2 group transition-all md:w-32"
                                    >
                                        <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase text-center leading-tight">Abrir Chat Privado</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequests;
