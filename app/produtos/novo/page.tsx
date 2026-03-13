'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { ChevronLeft, Save, Image as ImageIcon, Tag, AlignLeft, Upload, Link2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const statuses = ['ativo', 'inativo', 'em-estoque', 'baixo-estoque', 'esgotado'];
const statusLabels: Record<string, string> = {
    'ativo': 'Ativo', 'inativo': 'Inativo', 'em-estoque': 'Em Estoque',
    'baixo-estoque': 'Baixo Estoque', 'esgotado': 'Esgotado'
};

export default function NovoProdutoPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', price: '', category: '', status: 'em-estoque',
        image: '', description: '', tags: '',
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError('');
        setIsUploading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploadError('Não autenticado.'); setIsUploading(false); return; }

        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
        if (upErr) { setUploadError('Erro ao enviar imagem. Tente novamente.'); setIsUploading(false); return; }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        setFormData(prev => ({ ...prev, image: urlData.publicUrl }));
        setIsUploading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Não autenticado.'); setIsSaving(false); return; }
        const { error: err } = await supabase.from('products').insert({
            profile_id: user.id,
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            category: formData.category,
            status: formData.status,
            image_url: formData.image,
            description: formData.description,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        });
        if (err) { setError(err.message); setIsSaving(false); return; }
        router.push('/produtos');
        router.refresh();
    };

    return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/produtos" className="w-10 h-10 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest/60 hover:text-forest hover:bg-mint transition-colors shadow-sm">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-forest">Novo Produto</h1>
                            <p className="text-forest/50 text-sm mt-0.5">Adicione um novo item ao seu catálogo.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-card border border-mint-dark overflow-hidden">
                        <form onSubmit={handleSave} className="p-6 sm:p-8">
                            {/* ── Image Section ── */}
                            <div className="mb-10 pb-10 border-b border-mint-dark">
                                <h3 className="text-sm font-bold text-forest mb-4">Imagem do Produto</h3>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Preview */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-32 h-32 rounded-2xl bg-mint-dark flex items-center justify-center border-2 border-dashed border-forest/20 overflow-hidden flex-shrink-0 hover:border-lime hover:bg-lime/10 transition-all group"
                                    >
                                        {isUploading ? (
                                            <div className="w-7 h-7 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                        ) : formData.image ? (
                                            <>
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload size={20} className="text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-forest/40 group-hover:text-forest/70 transition-colors">
                                                <Upload size={22} className="mb-1" />
                                                <span className="text-xs font-medium text-center leading-tight px-1">Clique para carregar</span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />

                                    {/* URL + Upload button */}
                                    <div className="flex-1 w-full space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-forest/20 bg-mint/30 text-forest text-sm font-semibold hover:bg-lime/20 hover:border-lime transition-colors w-full sm:w-auto justify-center sm:justify-start"
                                        >
                                            <Upload size={16} />
                                            Enviar do computador
                                        </button>
                                        {uploadError && <p className="text-red-500 text-xs font-medium">{uploadError}</p>}

                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40"><Link2 size={16} /></div>
                                            <input
                                                type="url"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                                placeholder="Ou cole um link externo (https://...)"
                                            />
                                        </div>
                                        <p className="text-xs text-forest/40">JPG, PNG, WebP ou GIF · máx. 5 MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Nome do Produto *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                        placeholder="Ex: Cadeira Ergonômica" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Preço (R$) *</label>
                                    <input type="number" required min="0" step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        onBlur={(e) => {
                                            const v = parseFloat(e.target.value);
                                            if (!isNaN(v)) setFormData(prev => ({ ...prev, price: v.toFixed(2) }));
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                        placeholder="0.00" />

                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2 flex items-center justify-between">
                                        Categoria
                                        <span className="text-xs font-normal text-forest/40">(opcional)</span>
                                    </label>
                                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                        placeholder="Ex: Móveis, Roupas, Eletrônicos..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Status *</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer appearance-none transition-all">
                                        {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Descrição do Produto</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-4 text-forest/40"><AlignLeft size={18} /></div>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all resize-none"
                                            placeholder="Descreva os detalhes, material, medidas..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">Tags / Características (separado por vírgula)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40"><Tag size={18} /></div>
                                        <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                            placeholder="Ex: Madeira, Vintage, Frete Grátis" />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="mt-4 text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                            <div className="mt-10 pt-6 border-t border-mint-dark flex items-center justify-end gap-3">
                                <Link href="/produtos" className="px-6 py-3 rounded-full text-sm font-semibold text-forest/60 hover:text-forest hover:bg-mint transition-colors">Cancelar</Link>
                                <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-8 py-3 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark disabled:opacity-70 transition-colors shadow-sm active:scale-95">
                                    {isSaving ? <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin" /> : <Save size={18} />}
                                    {isSaving ? 'Salvando...' : 'Criar Produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
