import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, Shield, MessageSquare } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import { auth, db, doc, collection, query, orderBy, onSnapshot, updateDoc, addDoc, serverTimestamp } from '../firebase';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: any;
}

interface ChatProps {
    requestId: string;
    userProfile: any;
    onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ requestId, userProfile, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [requestData, setRequestData] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let unsubscribe: () => void;
        let unsubscribeReq: () => void;

        const setupChat = async () => {
            try {
                // Load Request Data (to check status and names)
                unsubscribeReq = onSnapshot(doc(db, "help_requests", requestId), (snapshot: any) => {
                    const data = snapshot.data();
                    console.log("Chat setup - Request Data:", data);
                    setRequestData(data);

                    const updateReceipt = async () => {
                        const isPriest = userProfile?.uid === data?.assistingPriestId;
                        const readField = isPriest ? 'lastReadAt_priest' : 'lastReadAt_requester';

                        await updateDoc(doc(db, "help_requests", requestId), {
                            [readField]: serverTimestamp()
                        });
                    };
                    updateReceipt();
                });

                // Load Messages
                const q = query(
                    collection(db, "help_requests", requestId, "messages"),
                    orderBy("timestamp", "asc")
                );

                unsubscribe = onSnapshot(q, (snapshot: any) => {
                    const fetched = snapshot.docs.map((doc: any) => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Message[];

                    setMessages(fetched);
                    setLoading(false);

                    // If a new message arrives while we're in the chat, mark it as read too
                    if (fetched.length > 0) {
                        const lastMsg = fetched[fetched.length - 1];
                        if (lastMsg.senderId !== userProfile?.uid) {
                            const markAsRead = async () => {
                                const isPriest = userProfile?.uid === requestData?.assistingPriestId;
                                const readField = isPriest ? 'lastReadAt_priest' : 'lastReadAt_requester';
                                await updateDoc(doc(db, "help_requests", requestId), {
                                    [readField]: serverTimestamp()
                                });
                            };
                            markAsRead();
                        }
                    }
                });
            } catch (err) {
                console.error("Error setting up chat:", err);
                setLoading(false);
            }
        };

        setupChat();
        return () => {
            unsubscribe && unsubscribe();
            unsubscribeReq && unsubscribeReq();
        };
    }, [requestId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const text = newMessage;
        setNewMessage('');

        try {
            if (auth.currentUser) {
                // Add message
                await addDoc(collection(db, "help_requests", requestId, "messages"), {
                    senderId: auth.currentUser.uid,
                    senderName: userProfile?.name || 'Usuário',
                    text: text,
                    timestamp: serverTimestamp()
                });

                // Update parent request with metadata for alerts
                await updateDoc(doc(db, "help_requests", requestId), {
                    lastMessageAt: serverTimestamp(),
                    lastSenderId: auth.currentUser.uid,
                    lastMessageText: text // Optional: show preview in list
                });
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const otherPersonName = userProfile?.uid === requestData?.userId
        ? requestData?.assistingPriestName || 'Padre'
        : requestData?.userName || 'Irmão';

    return (
        <div className="h-full max-w-4xl mx-auto flex flex-col animate-in fadeIn duration-700">
            {/* Header */}
            <div className="bg-white dark:bg-stone-900 p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-gold-400/20">
                            {userProfile?.uid === requestData?.userId ? <Shield size={20} /> : <User size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 leading-none">{otherPersonName}</h3>
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Em Atendimento
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] bg-stone-50/50 dark:bg-stone-950/20"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <MessageSquare size={48} className="text-stone-300 mb-4" />
                        <p className="text-sm font-serif italic">Inicie a conversa com seu irmão na fé.</p>
                        <p className="text-[10px] uppercase mt-2">A paz esteja convosco.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === userProfile?.uid;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isMe
                                    ? 'bg-gold-500 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-800 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-70 ${isMe ? 'text-white/80' : 'text-stone-400'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 sticky bottom-0">
                {requestData?.status === 'completed' ? (
                    <div className="p-4 bg-stone-50 dark:bg-stone-950/50 rounded-xl text-center text-sm text-stone-500 italic">
                        Este atendimento foi encerrado.
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escreva sua mensagem..."
                            className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all dark:text-stone-100"
                        />
                        <Button type="submit" className="w-12 h-12 rounded-xl flex items-center justify-center p-0">
                            <Send size={20} />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat;
