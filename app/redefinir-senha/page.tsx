'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'form' | 'success' | 'invalid';

export default function RedefinirSenhaPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [step, setStep] = useState<Step>('form');

    // Supabase redireciona com o token na URL como hash fragment.
    // O cliente SSR processa isso automaticamente ao instanciar.
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // Sessão válida de recuperação — mantém o formulário visível.
                setStep('form');
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (password.length < 6) {
            setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setErrorMsg('Não foi possível redefinir a senha. O link pode ter expirado. Solicite um novo.');
            return;
        }

        setStep('success');
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
                        {step === 'form' && (
                            <>
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mb-3 shadow-sm">
                                        <span className="text-forest font-bold text-2xl" style={{ fontFamily: "Georgia, serif" }}>V</span>
                                    </div>
                                    <p className="font-bold text-forest text-lg tracking-tight">A vitrine do seu negócio</p>
                                    <h1 className="text-2xl font-bold text-forest mt-4 text-center leading-snug">
                                        Criar nova senha
                                    </h1>
                                    <p className="text-forest/50 text-sm mt-1.5 text-center">
                                        Escolha uma senha forte para proteger sua conta.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Nova senha */}
                                    <div>
                                        <label className="block text-sm font-semibold text-forest mb-1.5">Nova senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Mínimo 6 caracteres"
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

                                    {/* Confirmar senha */}
                                    <div>
                                        <label className="block text-sm font-semibold text-forest mb-1.5">Confirmar senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repita a nova senha"
                                                required
                                                className="w-full pl-10 pr-12 py-3.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/30 hover:text-forest/60 transition-colors"
                                            >
                                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indicador de força da senha */}
                                    {password.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                            password.length >= [4, 7, 10, 13][i]
                                                                ? password.length < 7 ? 'bg-red-400' : password.length < 10 ? 'bg-yellow-400' : 'bg-lime'
                                                                : 'bg-forest/10'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-forest/40">
                                                {password.length < 7 ? 'Fraca' : password.length < 10 ? 'Média' : 'Forte'}
                                            </p>
                                        </div>
                                    )}

                                    {errorMsg && (
                                        <p className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">
                                            {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-bold py-4 rounded-full hover:bg-lime-dark active:scale-95 transition-all duration-200 shadow-sm text-sm mt-2 disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                        ) : (
                                            'Salvar nova senha'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-lime-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-forest mb-2">Senha redefinida!</h1>
                                <p className="text-forest/60 text-sm leading-relaxed mb-8">
                                    Sua senha foi atualizada com sucesso. Agora você pode entrar com a nova senha.
                                </p>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-bold py-4 rounded-full hover:bg-lime-dark active:scale-95 transition-all duration-200 shadow-sm text-sm"
                                >
                                    Ir para o login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
