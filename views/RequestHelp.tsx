import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import RequestHelpForm from '@/views/RequestHelpForm';
import MyRequests from './MyRequests';

interface RequestHelpProps {
    userProfile?: any;
    onOpenChat: (requestId: string) => void;
}

const RequestHelp: React.FC<RequestHelpProps> = ({ userProfile, onOpenChat }) => {
    const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

    return (
        <div className="h-full flex flex-col gap-8 animate-in fadeIn duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                        <MessageSquare className="text-gold-500 w-6 h-6 md:w-8 md:h-8" /> Auxílio Espiritual
                    </h2>
                    <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 mt-1 italic">Estamos aqui para caminhar com você na fé.</p>
                </div>

                {/* Tabs */}
                <div className="flex w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide bg-stone-100 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <button
                        onClick={() => setActiveTab('request')}
                        className={`flex-1 md:flex-none whitespace-nowrap px-4 md:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'request'
                            ? 'bg-white dark:bg-stone-800 text-gold-600 dark:text-gold-400 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                            }`}
                    >
                        Pedir Ajuda
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 md:flex-none whitespace-nowrap px-4 md:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history'
                            ? 'bg-white dark:bg-stone-800 text-gold-600 dark:text-gold-400 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                            }`}
                    >
                        Meus Pedidos
                    </button>
                </div>
            </div>

            {activeTab === 'request' ? (
                <RequestHelpForm userProfile={userProfile} />
            ) : (
                <MyRequests userProfile={userProfile} onOpenChat={onOpenChat} />
            )}
        </div>
    );
};

export default RequestHelp;
