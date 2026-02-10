import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Cross } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '../../firebase';

interface LoginProps {
    onRegisterClick: () => void;
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha ao entrar com Google.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-stone-950 transition-colors duration-300 overflow-y-auto">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gold-400 shadow-xl shadow-gold-200/50 dark:shadow-none mb-6">
                        <Cross size={40} className="text-white" />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">Abraço do Pai</h1>
                    <p className="text-stone-500 dark:text-stone-400">Entre na sua jornada de fé e oração.</p>
                </div>

                <Card className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Senha</label>
                                <button type="button" className="text-xs text-gold-600 dark:text-gold-500 font-bold hover:underline">Esqueceu?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl pl-12 pr-4 py-3 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                            {!loading && <ArrowRight className="ml-2" size={18} />}
                        </Button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-100 dark:border-stone-800"></div>
                            </div>
                            <span className="relative bg-white dark:bg-stone-900 px-4 text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">Ou continue com</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-3 px-4 py-3 border border-stone-100 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                                <span className="text-sm font-bold text-stone-700 dark:text-stone-300">Entrar com Google</span>
                            </button>
                        </div>
                    </div>
                </Card>

                <p className="text-center mt-8 text-sm text-stone-500 dark:text-stone-400">
                    Não tem uma conta?{' '}
                    <button
                        onClick={onRegisterClick}
                        className="text-gold-600 dark:text-gold-500 font-bold hover:underline"
                    >
                        Cadastre-se agora
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
