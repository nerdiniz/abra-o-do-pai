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
                }, (error) => {
                    console.error("Error fetching messages:", error);
                    setLoading(false);
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
        <div className="h-full w-full flex flex-col bg-white dark:bg-stone-950 animate-in fadeIn duration-500">
            {/* Header */}
            <div className="bg-white dark:bg-stone-900 px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center text-white shadow-md shadow-gold-500/20 shrink-0">
                            {userProfile?.uid === requestData?.userId ? <Shield size={20} /> : <User size={20} />}
                        </div>
                        <div className="leading-tight">
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-base">{otherPersonName}</h3>
                            <p className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                                Em Atendimento
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-stone-50/50 dark:bg-stone-950/20"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 select-none">
                        <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-stone-400" />
                        </div>
                        <p className="text-sm font-serif italic text-stone-500">Inicie a conversa com seu irmão na fé.</p>
                        <p className="text-[10px] uppercase mt-2 font-bold tracking-widest text-stone-400">A paz esteja convosco</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === userProfile?.uid;
                        // Grouping logic could go here (e.g. check previous message sender)

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-2xl px-5 py-3 shadow-sm relative ${isMe
                                        ? 'bg-gold-500 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border border-stone-100 dark:border-stone-800 rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-widest px-1 ${isMe ? 'text-stone-400 text-right' : 'text-stone-400'}`}>
                                        {msg.timestamp?.seconds
                                            ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : 'Enviando...'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 sticky bottom-0 z-20 pb-safe">
                {requestData?.status === 'completed' ? (
                    <div className="p-4 bg-stone-50 dark:bg-stone-950/50 rounded-xl text-center text-sm text-stone-500 italic border border-stone-100 dark:border-stone-800">
                        Este atendimento foi encerrado.
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto w-full">
                        <div className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-gold-400/50 focus-within:border-gold-400 transition-all">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escreva sua mensagem..."
                                className="w-full bg-transparent border-none p-0 text-sm md:text-base focus:outline-none focus:ring-0 text-stone-800 dark:text-stone-100 placeholder-stone-400"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center !p-0 shrink-0 bg-gold-500 text-white shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            <Send size={20} strokeWidth={2.5} />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat;
