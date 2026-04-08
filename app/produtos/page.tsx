'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import CustomSelect from '@/app/components/CustomSelect';
import Badge from '@/app/components/Badge';
import { createClient } from '@/lib/supabase/client';
import {
    Plus, Share2, Search, ChevronDown, Pencil, Trash2, AlertTriangle, Boxes, X
} from 'lucide-react';

const statuses = ['Todos', 'em-estoque', 'esgotado'];
const ITEMS_PER_PAGE = 10;

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    status: string;
    image_url: string;
    description: string;
    tags: string[];
    wholesale_price: number | null;
    wholesale_min_qty: number | null;
};

export default function ProdutosPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [categories, setCategories] = useState<string[]>(['Todos']);
    const [status, setStatus] = useState('Todos');
    const [page, setPage] = useState(1);
    const [showToast, setShowToast] = useState('');
    const [profile, setProfile] = useState<{ id: string, slug: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Share Modal States
    const [showShareModal, setShowShareModal] = useState(false);
    const [slugInput, setSlugInput] = useState('');
    const [slugError, setSlugError] = useState('');
    const [isSavingSlug, setIsSavingSlug] = useState(false);

    // Wholesale Modal
    const [showWholesaleModal, setShowWholesaleModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: prof } = await supabase.from('profiles').select('id, slug').eq('id', user.id).single();
        setProfile(prof);
        if (prof) setSlugInput(prof.slug);

        const { data } = await supabase.from('products').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
        setProducts(data || []);
        // Build dynamic category list from the user's products
        const uniqueCats = Array.from(new Set((data || []).map((p: Product) => p.category).filter(Boolean)));
        setCategories(['Todos', ...uniqueCats]);
        setLoading(false);
    }

    const handleCopyLink = async () => {
        if (!profile) return;
        const url = `${window.location.origin}/c/${profile.slug}`;
        await navigator.clipboard.writeText(url);
        setShowToast('Link copiado!');
        setTimeout(() => setShowToast(''), 3000);
    };

    const handleSaveSlug = async () => {
        if (!profile) return;
        setSlugError('');

        const newSlug = slugInput.trim().toLowerCase();

        // Basic validation
        if (!newSlug) {
            setSlugError('O link não pode ficar vazio.');
            return;
        }
        if (!/^[a-z0-9-]+$/.test(newSlug)) {
            setSlugError('Use apenas letras minúsculas, números e hífens.');
            return;
        }

        if (newSlug === profile.slug) {
            setShowShareModal(false);
            return; // No change
        }

        setIsSavingSlug(true);
        const supabase = createClient();

        // Check uniqueness
        const { data: existing } = await supabase.from('profiles').select('id').eq('slug', newSlug).maybeSingle();
        if (existing && existing.id !== profile.id) {
            setSlugError('Este link já está em uso por outra loja.');
            setIsSavingSlug(false);
            return;
        }

        // Save
        const { error } = await supabase.from('profiles').update({ slug: newSlug }).eq('id', profile.id);

        setIsSavingSlug(false);
        if (error) {
            setSlugError('Erro ao salvar. Tente novamente.');
        } else {
            setProfile({ ...profile, slug: newSlug });
            setShowToast('Link atualizado!');
            setTimeout(() => setShowToast(''), 3000);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const supabase = createClient();
        const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id);
        if (!error) {
            setProducts(products.filter(p => p.id !== deleteTarget.id));
            setShowToast('Produto excluído com sucesso!');
            setTimeout(() => setShowToast(''), 3000);
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        const shortCode = p.id.substring(0, 8).toUpperCase();
        const matchSearch =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            shortCode.includes(q.toUpperCase());
        const matchCategory = category === 'Todos' || p.category === category;
        const matchStatus = status === 'Todos' || p.status === status;
        return matchSearch && matchCategory && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="flex min-h-screen bg-mint relative">
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-6 py-3 rounded-full font-medium text-sm shadow-xl flex items-center gap-2 transition-all">
                    <div className="w-5 h-5 rounded-full bg-lime text-forest flex items-center justify-center">✓</div>
                    {showToast}
                </div>
            )}
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-forest">Meus Produtos</h1>
                        <p className="text-forest/50 text-sm mt-0.5">Gerencie seu catálogo e estoque em um só lugar.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-forest/20 bg-white text-forest text-sm font-semibold hover:bg-mint transition-colors shadow-soft">
                            <Share2 size={15} />
                            Catálogo Varejo
                        </button>
                        <button onClick={() => setShowWholesaleModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors shadow-soft">
                            <Boxes size={15} />
                            Catálogo Atacado
                        </button>
                        <Link href="/produtos/novo" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark transition-colors shadow-sm">
                            <Plus size={16} />
                            Novo Produto
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-card border border-mint-dark mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-52">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Buscar por nome, categoria ou código..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        <CustomSelect
                            value={category}
                            onChange={(val) => { setCategory(val); setPage(1); }}
                            options={categories.map(c => ({ value: c, label: `Categoria: ${c}` }))}
                        />
                        <CustomSelect
                            value={status}
                            onChange={(val) => { setStatus(val); setPage(1); }}
                            options={[
                                { value: 'Todos', label: 'Status: Todos' },
                                { value: 'em-estoque', label: 'Em Estoque' },
                                { value: 'esgotado', label: 'Esgotado' }
                            ]}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-mint-dark overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-forest/40 text-sm">Carregando produtos...</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-mint-dark">
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-4">Imagem</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Nome do Produto</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Preço</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Preço Atacado</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Categoria</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Status</th>
                                    <th className="text-right text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-mint-dark">
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-forest/40 text-sm">Nenhum produto encontrado.</td></tr>
                                ) : (
                                    paginated.map((product) => (
                                        <tr key={product.id} className="hover:bg-mint/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-mint-dark flex-shrink-0">
                                                    <img src={product.image_url || 'https://via.placeholder.com/100'} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-forest text-sm">{product.name}</p>
                                                <p className="text-xs text-forest/40 font-mono mt-0.5">#{product.id.substring(0, 8).toUpperCase()}</p>
                                            </td>
                                            <td className="px-4 py-4"><p className="text-forest font-medium text-sm">{formatPrice(product.price)}</p></td>
                                            <td className="px-4 py-4">
                                                {product.wholesale_price ? (
                                                    <p className="text-amber-700 font-bold text-sm bg-amber-50 inline-block px-2 py-0.5 rounded-md border border-amber-200">
                                                        {formatPrice(product.wholesale_price)}
                                                    </p>
                                                ) : (
                                                    <p className="text-forest/30 text-sm">-</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4"><p className="text-forest/60 text-sm">{product.category}</p></td>
                                            <td className="px-4 py-4"><Badge status={product.status as any} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/produtos/${product.id}/editar`} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:bg-mint hover:text-forest transition-colors"><Pencil size={14} /></Link>
                                                    <button onClick={() => setDeleteTarget(product)} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    <div className="flex items-center justify-between px-6 py-4 border-t border-mint-dark">
                        <p className="text-xs text-forest/40">
                            Mostrando {filtered.length === 0 ? 0 : Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)} a {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} resultados
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-full text-xs font-medium text-forest/60 border border-mint-dark hover:bg-mint disabled:opacity-40 transition-colors">Anterior</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${p === page ? 'bg-lime text-forest' : 'text-forest/50 hover:bg-mint border border-mint-dark'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-full text-xs font-medium text-forest/60 border border-mint-dark hover:bg-mint disabled:opacity-40 transition-colors">Próximo</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-forest text-center mb-2">Excluir produto?</h2>
                        <p className="text-forest/60 text-sm text-center mb-1">Você está prestes a excluir permanentemente:</p>
                        <p className="font-bold text-forest text-center mb-6 text-base">&ldquo;{deleteTarget.name}&rdquo;</p>
                        <p className="text-xs text-forest/40 text-center mb-8">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Wholesale Catalog Modal */}
            {showWholesaleModal && profile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setShowWholesaleModal(false)} className="absolute top-6 right-6 text-forest/40 hover:text-forest transition-colors">
                            <X size={20} />
                        </button>

                        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                            <Boxes size={24} className="text-amber-700" />
                        </div>

                        <h2 className="text-xl font-bold text-forest text-center mb-1">Catálogo Atacado</h2>
                        <p className="text-forest/60 text-sm text-center mb-6">Compartilhe este link com seus clientes atacadistas.</p>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-forest mb-2">Link do Catálogo Atacado</label>
                            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                                <span className="pl-4 pr-2 py-3 text-xs text-amber-700 select-none bg-amber-100 border-r border-amber-200 font-mono whitespace-nowrap">
                                    meucatalogo.com/a/
                                </span>
                                <span className="px-3 py-3 text-sm text-amber-900 font-semibold truncate">{profile.slug}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={async () => {
                                    const url = `${window.location.origin}/a/${profile.slug}`;
                                    await navigator.clipboard.writeText(url);
                                    setShowWholesaleModal(false);
                                    setShowToast('Link do atacado copiado!');
                                    setTimeout(() => setShowToast(''), 3000);
                                }}
                                className="w-full py-3.5 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors shadow-card flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} />
                                Copiar Link
                            </button>
                            <a
                                href={`/a/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors text-center"
                            >
                                Visualizar Catálogo Atacado
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Catalog Modal */}
            {showShareModal && profile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 text-forest/40 hover:text-forest transition-colors">
                            <X size={20} />
                        </button>

                        <div className="w-14 h-14 rounded-full bg-mint flex items-center justify-center mx-auto mb-5">
                            <Share2 size={24} className="text-forest" />
                        </div>

                        <h2 className="text-xl font-bold text-forest text-center mb-1">Catálogo Varejo</h2>
                        <p className="text-forest/60 text-sm text-center mb-6">Compartilhe este link com seus clientes.</p>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-forest mb-2">Link do Catálogo Varejo</label>
                            <div className="flex items-center bg-mint/30 border border-mint-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-lime transition-shadow">
                                <span className="pl-4 pr-2 py-3 text-xs text-forest/50 select-none bg-mint-dark/10 border-r border-mint-dark font-mono whitespace-nowrap">
                                    meucatalogo.com/c/
                                </span>
                                <input
                                    type="text"
                                    value={slugInput}
                                    onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="flex-1 bg-transparent px-3 py-3 text-sm text-forest font-semibold focus:outline-none"
                                    placeholder="sua-loja"
                                />
                            </div>
                            {slugError && <p className="text-red-500 text-xs font-medium mt-2">{slugError}</p>}
                            {slugInput !== profile.slug && (
                                <button
                                    onClick={handleSaveSlug}
                                    disabled={isSavingSlug}
                                    className="w-full mt-3 py-2.5 rounded-full bg-forest/10 text-forest font-bold text-xs hover:bg-forest/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingSlug ? <div className="w-3 h-3 border-2 border-forest/30 border-t-forest rounded-full animate-spin" /> : null}
                                    {isSavingSlug ? 'Salvando...' : 'Salvar Alterações no Link'}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3.5 rounded-full bg-forest text-white font-bold text-sm hover:bg-forest/90 transition-colors shadow-card flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} />
                                Copiar Link
                            </button>
                            <a
                                href={`/c/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors text-center"
                            >
                                Visualizar Catálogo Varejo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
