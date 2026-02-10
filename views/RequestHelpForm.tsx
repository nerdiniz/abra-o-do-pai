import React, { useState } from 'react';
import { Send, User, Phone, HelpCircle, CheckCircle, Info, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { auth, db, collection, addDoc, serverTimestamp } from '../firebase';

interface RequestHelpFormProps {
    userProfile?: any;
}

const RequestHelpForm: React.FC<RequestHelpFormProps> = ({ userProfile }) => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        contact: userProfile?.phone || '',
        type: 'Spiritual',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            if (auth.currentUser) {
                await addDoc(collection(db, "help_requests"), {
                    userId: auth.currentUser.uid,
                    userEmail: auth.currentUser.email,
                    userName: userProfile?.name || formData.name,
                    city: (userProfile?.address?.city || 'Não Informada').toUpperCase(),
                    ...formData,
                    status: 'pending',
                    timestamp: serverTimestamp()
                });
                setSubmitted(true);
            }
        } catch (err) {
            console.error("Error submitting help request:", err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="h-full flex items-center justify-center py-20 animate-in zoom-in-95 duration-500 w-full">
                <Card className="max-w-md w-full p-8 text-center border-none shadow-2xl bg-white dark:bg-stone-900">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">Pedido Enviado</h2>
                    <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-serif">
                        Sua solicitação de auxílio espiritual foi registrada. Um sacerdote ou membro da pastoral entrará em contato em breve. Que a paz de Cristo esteja com você!
                    </p>
                    <Button className="mt-8 w-full" onClick={() => setSubmitted(false)}>
                        Enviar Novo Pedido
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Help Form */}
            <Card className="p-6 md:p-8 border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 block">Seu Nome</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Seu nome completo"
                                    className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 block">Contato</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={formData.contact}
                                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 block">Cidade</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50" size={18} />
                                    <input
                                        disabled
                                        type="text"
                                        value={userProfile?.address?.city || 'Não Informada'}
                                        className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-400 dark:text-stone-500 cursor-not-allowed italic text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 block">Tipo de Auxílio</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl py-3 px-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all appearance-none"
                            >
                                <option value="Spiritual">Direção Espiritual</option>
                                <option value="Confession">Pedido de Confissão</option>
                                <option value="Prayer">Pedido de Oração</option>
                                <option value="Anointing">Unção dos Enfermos</option>
                                <option value="Support">Auxílio em Dificuldades</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 block">Mensagem</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Como podemos te ajudar hoje?"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl py-3 px-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all resize-none font-serif"
                            ></textarea>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-md font-bold gap-3 shadow-xl shadow-gold-500/20">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
                        Enviar para os Padres da Cidade
                    </Button>
                </form>
            </Card>

            {/* Info Area */}
            <div className="space-y-6">
                <div className="bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800/30 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-gold-500/10">
                        <HelpCircle size={140} />
                    </div>
                    <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Como funciona?</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">Seu pedido é enviado para todos os sacerdotes cadastrados em sua cidade.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">O primeiro padre que visualizar e puder atender assumirá a sua solicitação.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">Você receberá um contato direto do sacerdote para agendar o auxílio.</p>
                        </li>
                    </ul>
                </div>

                <div className="flex gap-4 p-6 border border-stone-100 dark:border-stone-800 rounded-3xl bg-stone-50 dark:bg-stone-900/20">
                    <Info className="text-gold-500 shrink-0" size={24} />
                    <div>
                        <h5 className="font-serif font-bold text-stone-700 dark:text-stone-300 italic">"Ninguém tem maior amor do que aquele que dá a sua vida pelos seus amigos."</h5>
                        <p className="text-[10px] text-stone-400 uppercase mt-1">João 15:13</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestHelpForm;
