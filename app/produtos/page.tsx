'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Badge from '@/app/components/Badge';
import { createClient } from '@/lib/supabase/client';
import {
    Plus, Share2, Search, ChevronDown, Pencil, Trash2, AlertTriangle
} from 'lucide-react';

const categories = ['Todos', 'Móveis', 'Iluminação', 'Decoração', 'Outros'];
const statuses = ['Todos', 'ativo', 'inativo', 'em-estoque', 'baixo-estoque', 'esgotado'];
const ITEMS_PER_PAGE = 10;

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    status: string;
    image_url: string;
    tags: string[];
};

export default function ProdutosPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [status, setStatus] = useState('Todos');
    const [page, setPage] = useState(1);
    const [showToast, setShowToast] = useState('');
    const [profile, setProfile] = useState<{ slug: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: prof } = await supabase.from('profiles').select('slug').eq('id', user.id).single();
        setProfile(prof);
        const { data } = await supabase.from('products').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
        setProducts(data || []);
        setLoading(false);
    }

    const handleShareCatalog = async () => {
        if (!profile) return;
        const url = `${window.location.origin}/c/${profile.slug}`;
        await navigator.clipboard.writeText(url);
        setShowToast('Link do catálogo copiado!');
        setTimeout(() => setShowToast(''), 3000);
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
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
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
                        <button onClick={handleShareCatalog} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-forest/20 bg-white text-forest text-sm font-semibold hover:bg-mint transition-colors shadow-soft">
                            <Share2 size={15} />
                            Compartilhar Catálogo
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
                                placeholder="Buscar por nome ou categoria..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        <div className="relative">
                            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-mint border border-mint-dark text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer">
                                {categories.map(c => <option key={c}>Categoria: {c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 pointer-events-none" size={14} />
                        </div>
                        <div className="relative">
                            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-mint border border-mint-dark text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer">
                                {statuses.map(s => <option key={s} value={s}>Status: {s === 'Todos' ? 'Todos' : s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 pointer-events-none" size={14} />
                        </div>
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
        </div>
    );
}
