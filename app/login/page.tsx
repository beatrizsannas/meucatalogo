'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg('E-mail ou senha inválidos. Tente novamente.');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-forest flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-lime/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-lime/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-lime to-green-300" />

                    <div className="px-8 pt-10 pb-10">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mb-3 shadow-sm">
                                <span className="text-forest font-bold text-2xl" style={{ fontFamily: "Georgia, serif" }}>V</span>
                            </div>
                            <p className="font-bold text-forest text-lg tracking-tight">A vitrine do seu negócio</p>
                            <div className="w-12 h-px bg-mint-dark my-4" />
                            <h1 className="text-2xl font-bold text-forest mt-2 text-center leading-snug">
                                Acesse sua conta
                            </h1>
                            <p className="text-forest/50 text-sm mt-1.5 text-center">
                                Insira seus dados para continuar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nome@exemplo.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/30 hover:text-forest/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end mt-1.5">
                                <Link href="/esqueci-senha" className="text-xs text-forest/50 hover:text-forest transition-colors">
                                    Esqueci minha senha
                                </Link>
                            </div>

                            {errorMsg && (
                                <p className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-bold py-4 rounded-full hover:bg-lime-dark active:scale-95 transition-all duration-200 shadow-sm text-sm mt-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                ) : (
                                    <>Entrar <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-forest/50 mt-6">
                            Não tem uma conta?{' '}
                            <Link href="/cadastro" className="font-bold text-forest hover:text-forest/70 transition-colors">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
