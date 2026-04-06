'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronDown, Leaf, MessageCircle, Boxes, Tag, PackageSearch } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { WholesaleCartProvider, useWholesaleCart } from '@/app/context/WholesaleCartContext';
import WholesaleCartDrawer from '@/app/components/WholesaleCartDrawer';

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
    wholesale_label: boolean;
    wholesale_label_price: number | null;
};

type Profile = {
    id: string;
    store_name: string;
    description: string;
    logo_url: string;
    whatsapp: string;
    slug: string;
    brand_color: string;
};

const FALLBACK_LOGO = 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=100&h=100&fit=crop';

export default function WholesaleCatalogPage() {
    const params = useParams();
    const companyId = params?.companyId as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    useEffect(() => {
        if (companyId) loadStore();
    }, [companyId]);

    async function loadStore() {
        try {
            const supabase = createClient();
            const { data: prof, error: profError } = await supabase
                .from('profiles')
                .select('*')
                .eq('slug', companyId)
                .maybeSingle();

            if (profError || !prof) { setLoading(false); return; }
            setProfile(prof);

            const { data: prods } = await supabase
                .from('products')
                .select('*')
                .eq('profile_id', prof.id)
                .neq('status', 'inativo')
                .not('wholesale_price', 'is', null)
                .order('created_at', { ascending: false });

            setProducts(prods || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort((a,b) => a.localeCompare(b))];

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'Todos' || p.category === category;
        return matchSearch && matchCategory;
    });

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const waLink = profile?.whatsapp
        ? `https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}?text=Olá! Vim pelo Catálogo Atacado e gostaria de fazer um pedido.`
        : '#';

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50/60 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-amber-50/60 flex items-center justify-center flex-col gap-2 p-4 text-center">
                <Boxes size={40} className="text-amber-400/50" />
                <p className="text-amber-900/60 font-medium">Loja não encontrada.</p>
                <Link href="/" className="mt-4 text-amber-700 underline text-sm font-medium hover:text-amber-900 transition-colors">Voltar ao início</Link>
            </div>
        );
    }

    return (
        <WholesaleCartProvider>
            <div className="min-h-screen bg-amber-50/40 pb-12">
                {/* Header */}
            <header className="relative z-10 mx-3 mt-3 mb-0">
                <div className="bg-white rounded-3xl border border-amber-200 shadow-[0_4px_24px_0_rgba(120,80,0,0.07)] overflow-hidden">
                    {/* Faixa amber no topo */}
                    <div className="h-1.5 w-full bg-amber-400" />

                    <div className="pt-8 pb-7 px-6 flex flex-col items-center text-center">
                        {/* Logo */}
                        <div className="relative mb-5">
                            <div className="w-[88px] h-[88px] rounded-full p-[3px] shadow-md bg-amber-400">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white ring-2 ring-white">
                                    <img src={profile.logo_url || FALLBACK_LOGO} alt={profile.store_name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full blur-md opacity-40 bg-amber-400" />
                        </div>

                        {/* Nome + badge */}
                        <div className="flex flex-col items-center gap-2 mb-1">
                            <h1 className="text-2xl font-extrabold text-forest tracking-tight leading-tight">
                                {profile.store_name}
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-widest">
                                <Boxes size={12} />
                                Catálogo Atacado
                            </span>
                        </div>

                        {/* Separador */}
                        <div className="flex items-center gap-2 mb-3 mt-3">
                            <div className="h-px w-8 bg-amber-200" />
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <div className="h-px w-8 bg-amber-200" />
                        </div>

                        {/* Descrição */}
                        {profile.description && (
                            <p className="text-forest/60 max-w-sm mb-6 text-[13px] leading-relaxed whitespace-pre-line text-center">
                                {profile.description}
                            </p>
                        )}

                        {/* Botões de ação */}
                        <div className="flex items-center justify-center gap-3 w-full max-w-xs mt-2">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-amber-400 text-amber-900 font-bold hover:bg-amber-500 transition-all shadow-sm active:scale-95 text-sm border border-amber-500"
                            >
                                <MessageCircle size={16} />
                                Fale Conosco
                            </a>
                            <Link
                                href={`/a/${companyId}/pedidos`}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-bold hover:bg-amber-200 transition-colors shadow-sm active:scale-95 text-sm"
                            >
                                <PackageSearch size={16} />
                                Meus Pedidos
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 pt-4">
                {/* Search & Filter */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar produtos..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200 text-forest placeholder:text-forest/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
                        />
                    </div>
                    <div className="relative min-w-[160px]">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full flex items-center justify-between pl-4 pr-10 py-3 rounded-xl bg-amber-50/60 border border-amber-200 text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer transition-all text-left"
                        >
                            <span className="truncate pr-2">{category}</span>
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} size={16} />
                        </button>

                        {isCategoryOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl border border-amber-200 shadow-[0_4px_20px_0_rgba(120,80,0,0.1)] z-50 overflow-hidden py-2 max-h-60 overflow-y-auto">
                                    {categories.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => { setCategory(c); setIsCategoryOpen(false); }}
                                            className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${category === c ? 'bg-amber-100/50 text-amber-900 font-bold' : 'text-forest/70 hover:bg-amber-50 hover:text-amber-900 font-medium'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Info banner */}
                <div className="flex items-center gap-2 mb-5 px-1">
                    <div className="w-1 h-4 rounded-full bg-amber-400" />
                    <p className="text-xs text-amber-700 font-medium">
                        {filtered.length} produto{filtered.length !== 1 ? 's' : ''} com preço atacado disponíve{filtered.length !== 1 ? 'is' : 'l'}
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-amber-700/50 bg-white rounded-3xl border border-dashed border-amber-200">
                            <Boxes size={48} className="mx-auto mb-4 text-amber-300" />
                            <p className="font-medium text-lg text-amber-800/60">Nenhum produto encontrado</p>
                            <p className="text-sm text-amber-600/40">Tente ajustar sua busca ou categoria.</p>
                        </div>
                    ) : (
                        filtered.map(product => (
                            <WholesaleProductCard key={product.id} product={product} formatPrice={formatPrice} companyId={companyId} />
                        ))
                    )}
                </div>
            </main>

            <WholesaleCartDrawer profileId={profile.id} whatsapp={profile.whatsapp} />
        </div>
        </WholesaleCartProvider>
    );
}

function WholesaleProductCard({ product, formatPrice, companyId }: {
    product: Product;
    formatPrice: (v: number) => string;
    companyId: string;
}) {
    const { addToCart } = useWholesaleCart();
    const productUrl = `/a/${companyId}/p/${product.id}`;
    return (
        <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            {/* Imagem */}
            <Link href={productUrl} className="block relative aspect-square overflow-hidden bg-amber-50">
                <img
                    src={product.image_url || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge atacado */}
                <div className="absolute top-2 left-2">
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Atacado
                    </span>
                </div>
                {product.status === 'esgotado' && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">Esgotado</span>
                    </div>
                )}
            </Link>

            {/* Conteúdo */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={productUrl} className="hover:underline decoration-forest/30">
                    <h3 className="font-semibold text-forest text-sm leading-tight mb-0.5 line-clamp-2">{product.name}</h3>
                </Link>
                {product.category && <p className="text-forest/40 text-xs mb-3">{product.category}</p>}

                <div className="mt-auto space-y-2">
                    {/* Preço atacado em destaque */}
                    <p className="text-lg font-extrabold text-amber-700">
                        {formatPrice(product.wholesale_price!)}
                    </p>

                    {/* Quantidade mínima */}
                    {product.wholesale_min_qty && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-amber-400" />
                            <p className="text-xs text-forest/50 font-medium">
                                Mín. {product.wholesale_min_qty} unid.
                            </p>
                        </div>
                    )}

                    {/* Personalização com etiqueta */}
                    {product.wholesale_label && (
                        <div className="flex items-start gap-1.5 bg-amber-50 rounded-xl px-2.5 py-2 border border-amber-200">
                            <Tag size={11} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-amber-800 leading-tight">
                                    + Personalizado c/ etiqueta
                                </p>
                                {product.wholesale_label_price && (
                                    <p className="text-[11px] text-amber-700 font-bold">
                                        {formatPrice(product.wholesale_label_price)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    {product.status !== 'esgotado' && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                addToCart(product, product.wholesale_min_qty || 1, false);
                            }}
                            className="w-full mt-1 py-2 rounded-xl bg-amber-400 text-amber-900 font-bold text-sm hover:bg-amber-500 transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-500"
                        >
                            + Adicionar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
