'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { Camera, Save, Building2, Phone, AlignLeft, LogOut, CheckCircle2, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ConfiguracoesPage() {
    const router = useRouter();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [isDeactivating, setIsDeactivating] = useState(false);

    const [formData, setFormData] = useState({
        store_name: '',
        description: '',
        whatsapp: '',
        logo_url: '',
        brand_color: '#a8e63d',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setFormData(prev => ({
                ...prev,
                store_name: data.store_name || '',
                description: data.description || '',
                whatsapp: data.whatsapp || '',
                logo_url: data.logo_url || '',
                brand_color: data.brand_color || '#a8e63d',
            }));
        }
        setLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.newPassword || formData.confirmNewPassword) {
            if (formData.newPassword !== formData.confirmNewPassword) {
                setErrorMsg('As senhas não coincidem.');
                return;
            }
            if (formData.newPassword.length < 6) {
                setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }
        }

        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsSaving(false); return; }

        // Update profile
        const { error: profError } = await supabase.from('profiles').update({
            store_name: formData.store_name,
            description: formData.description,
            whatsapp: formData.whatsapp,
            logo_url: formData.logo_url,
            brand_color: formData.brand_color,
        }).eq('id', user.id);

        // Update password if provided
        if (formData.newPassword && !profError) {
            await supabase.auth.updateUser({ password: formData.newPassword });
        }

        setIsSaving(false);
        if (profError) {
            setErrorMsg('Erro ao salvar. Tente novamente.');
        } else {
            setFormData(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingLogo(true);
        setErrorMsg('');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsUploadingLogo(false); return; }
        const ext = file.name.split('.').pop();
        const path = `${user.id}/logo-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
        if (upErr) { setErrorMsg('Erro ao enviar logo. Tente novamente.'); setIsUploadingLogo(false); return; }
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        const publicUrl = urlData.publicUrl;
        // Auto-save the logo URL directly to the profile
        await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id);
        setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        setIsUploadingLogo(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleDeactivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deactivatePassword) return;
        setIsDeactivating(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) { setIsDeactivating(false); return; }

        // Re-authenticate first
        const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: deactivatePassword });
        if (error) { setIsDeactivating(false); setErrorMsg('Senha incorreta.'); return; }

        // Sign out and redirect
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-mint">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-mint relative">
            {/* Success Toast */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-6 py-3 rounded-full font-medium text-sm shadow-xl flex items-center gap-2 transition-all duration-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <CheckCircle2 size={18} className="text-lime" />
                Configurações salvas com sucesso!
            </div>

            <Sidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-forest">Configurações</h1>
                        <p className="text-forest/50 text-sm mt-0.5">Gerencie as informações da sua loja que aparecerão no catálogo público.</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-card border border-mint-dark overflow-hidden">
                        <form onSubmit={handleSave} className="p-6 sm:p-8">
                            {/* Logo Section */}
                            <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-10 border-b border-mint-dark">
                                {/* Avatar with upload */}
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="relative group flex-shrink-0"
                                >
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-mint-dark overflow-hidden ring-4 ring-mint">
                                        {isUploadingLogo ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-7 h-7 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                            </div>
                                        ) : formData.logo_url ? (
                                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-forest/30 text-4xl font-bold">
                                                {formData.store_name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center shadow-lg group-hover:bg-lime group-hover:text-forest transition-colors">
                                        <Camera size={14} />
                                    </div>
                                </button>

                                {/* Hidden file input */}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />

                                {/* Info + URL */}
                                <div className="flex-1 w-full">
                                    <h3 className="text-lg font-bold text-forest mb-1">Logo da Loja</h3>
                                    <p className="text-forest/50 text-sm mb-3">Clique no ícone 📷 para enviar do computador, ou cole um link abaixo.</p>
                                    <input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                        placeholder="Ou cole um link externo (https://...)" />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-forest mb-2">Nome da Loja</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40"><Building2 size={18} /></div>
                                            <input type="text" value={formData.store_name} onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                                placeholder="Ex: Meu Catálogo" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-forest mb-2">WhatsApp para Contato</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40"><Phone size={18} /></div>
                                            <input
                                                type="text"
                                                value={formData.whatsapp}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    let formatted = rawValue;
                                                    if (rawValue.length > 2) {
                                                        formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2)}`;
                                                    }
                                                    if (rawValue.length > 7) {
                                                        formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7, 11)}`;
                                                    }
                                                    setFormData({ ...formData, whatsapp: formatted });
                                                }}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                                placeholder="Ex: (81) 99999-9999"
                                                maxLength={15}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-forest mb-2">Cor Brand (Catálogo)</label>
                                        <div className="relative flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-mint-dark flex-shrink-0 cursor-pointer">
                                                <input
                                                    type="color"
                                                    value={formData.brand_color}
                                                    onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40"><Palette size={18} /></div>
                                                <input type="text" value={formData.brand_color?.toUpperCase()} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest font-mono placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all uppercase"
                                                    placeholder="#A8E63D" maxLength={7} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Descrição / Bio</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-4 text-forest/40"><AlignLeft size={18} /></div>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all resize-none"
                                            placeholder="Conte um pouco sobre sua loja..." />
                                    </div>
                                    <p className="text-right text-xs text-forest/40 mt-1">{formData.description.length} caracteres</p>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="mt-10 pt-10 border-t border-mint-dark">
                                <h3 className="text-lg font-bold text-forest mb-6">Segurança da Conta</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-forest mb-2">Nova Senha</label>
                                        <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                            placeholder="Deixe em branco para manter a atual" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-forest mb-2">Confirmar Nova Senha</label>
                                        <input type="password" value={formData.confirmNewPassword} onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                            placeholder="Confirme a senha digitada" />
                                    </div>
                                </div>
                                {errorMsg && <p className="text-red-500 text-sm font-semibold mt-4 bg-red-50 p-2 rounded-lg text-center">{errorMsg}</p>}
                            </div>

                            {/* Actions */}
                            <div className="mt-10 pt-6 border-t border-mint-dark flex items-center justify-end gap-3">
                                <button type="button" className="px-6 py-3 rounded-full text-sm font-semibold text-forest/60 hover:text-forest hover:bg-mint transition-colors" onClick={() => loadProfile()}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-8 py-3 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark disabled:opacity-70 transition-colors shadow-sm active:scale-95">
                                    {isSaving ? <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin" /> : <Save size={18} />}
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-8 bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-100">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Zona de Perigo</h3>
                        <p className="text-red-600/60 text-sm mb-6 max-w-2xl">Ações irreversíveis relacionadas à sua conta e catálogo.</p>
                        {!showDeactivateConfirm ? (
                            <button onClick={() => setShowDeactivateConfirm(true)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors shadow-sm">
                                <LogOut size={16} />
                                Sair / Desconectar
                            </button>
                        ) : (
                            <form onSubmit={handleDeactivate} className="bg-white p-6 rounded-2xl border border-red-200 mt-4 max-w-md">
                                <h4 className="font-bold text-forest text-sm mb-2">Confirmar Saída</h4>
                                <p className="text-forest/60 text-xs mb-4">Informe sua <strong className="text-forest">senha atual</strong> para confirmar.</p>
                                <input type="password" required value={deactivatePassword} onChange={(e) => setDeactivatePassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all mb-4"
                                    placeholder="Senha de acesso..." />
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setShowDeactivateConfirm(false)} className="px-4 py-2.5 rounded-full text-sm font-semibold text-forest/60 hover:text-forest hover:bg-mint transition-colors">Cancelar</button>
                                    <button type="submit" disabled={isDeactivating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-70 transition-colors shadow-sm">
                                        {isDeactivating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                        {isDeactivating ? 'Saindo...' : 'Confirmar e Sair'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
