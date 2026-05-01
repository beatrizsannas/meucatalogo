'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'form' | 'success';

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [step, setStep] = useState<Step>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/redefinir-senha`,
        });

        setLoading(false);

        if (error) {
            // Supabase não revela se o email existe por segurança,
            // mas ainda assim podemos mostrar um erro genérico em falhas técnicas.
            setErrorMsg('Ocorreu um erro. Por favor, tente novamente.');
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
                        {step === 'form' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mb-3 shadow-sm">
                                        <span className="text-forest font-bold text-2xl" style={{ fontFamily: "Georgia, serif" }}>V</span>
                                    </div>
                                    <p className="font-bold text-forest text-lg tracking-tight">A vitrine do seu negócio</p>
                                    <h1 className="text-2xl font-bold text-forest mt-4 text-center leading-snug">
                                        Recuperar senha
                                    </h1>
                                    <p className="text-forest/50 text-sm mt-1.5 text-center">
                                        Informe seu e-mail e enviaremos um link para você criar uma nova senha.
                                    </p>
                                </div>

                                {/* Form */}
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
                                            'Enviar link de recuperação'
                                        )}
                                    </button>
                                </form>

                                {/* Back to login */}
                                <div className="mt-6 flex justify-center">
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-1.5 text-sm text-forest/50 hover:text-forest transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                        Voltar para o login
                                    </Link>
                                </div>
                            </>
                        ) : (
                            /* Success state */
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-lime-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-forest mb-2">E-mail enviado!</h1>
                                <p className="text-forest/60 text-sm leading-relaxed mb-2">
                                    Se o endereço <span className="font-semibold text-forest">{email}</span> estiver cadastrado, você receberá um link para redefinir sua senha.
                                </p>
                                <p className="text-forest/40 text-xs mb-8">
                                    Verifique também sua caixa de spam.
                                </p>

                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest/70 transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                    Voltar para o login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
