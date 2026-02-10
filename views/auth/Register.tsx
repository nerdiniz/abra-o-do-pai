import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, ChevronLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { auth, createUserWithEmailAndPassword, updateProfile } from '../../firebase';

interface RegisterProps {
    onLoginClick: () => void;
    onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick, onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            onRegisterSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-stone-950 transition-colors duration-300 overflow-y-auto">
            <div className="max-w-md w-full">
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors mb-8 font-bold text-sm"
                >
                    <ChevronLeft size={18} />
                    Voltar para o Login
                </button>

                <div className="text-center mb-10">
                    <h1 className="font-serif text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">Criar Conta</h1>
                    <p className="text-stone-500 dark:text-stone-400 px-4">Junte-se a milhares de fiéis em sua jornada espiritual.</p>
                </div>

                <Card className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl pl-12 pr-4 py-3 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl pl-12 pr-4 py-3 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                                    placeholder="exemplo@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl pl-12 pr-4 py-3 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                                    placeholder="Crie uma senha forte"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full py-4 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Criando...' : 'Criar Minha Conta'}
                                {!loading && <UserPlus className="ml-2" size={18} />}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500 px-6">
                        Ao se cadastrar, você concorda com nossos{' '}
                        <button className="text-gold-600 dark:text-gold-500 font-bold hover:underline">Termos de Uso</button> e{' '}
                        <button className="text-gold-600 dark:text-gold-500 font-bold hover:underline">Privacidade</button>.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Register;
