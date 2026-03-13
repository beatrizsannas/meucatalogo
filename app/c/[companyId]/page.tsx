'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronDown, Leaf, MessageCircle, PackageSearch } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CartDrawer from '@/app/components/CartDrawer';
import { CartProvider, useCart } from '@/app/context/CartContext';

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    status: string;
    image_url: string;
    description: string;
    tags: string[];
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

export default function CatalogPublicPage() {
    const params = useParams();
    const companyId = params?.companyId as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');

    useEffect(() => {
        if (companyId) loadStore();
    }, [companyId]);

    async function loadStore() {
        try {
            const supabase = createClient();
            console.log('Fetching profile for slug:', companyId);

            const { data: prof, error: profError } = await supabase
                .from('profiles')
                .select('*')
                .eq('slug', companyId)
                .maybeSingle();

            if (profError) {
                console.error('Error fetching profile:', profError);
                setLoading(false);
                return;
            }

            if (!prof) {
                console.warn('No profile found for slug:', companyId);
                setLoading(false);
                return;
            }

            setProfile(prof);

            const { data: prods, error: prodsError } = await supabase
                .from('products')
                .select('*')
                .eq('profile_id', prof.id)
                .neq('status', 'inativo')
                .order('created_at', { ascending: false });

            if (prodsError) {
                console.error('Error fetching products:', prodsError);
            }

            setProducts(prods || []);
        } catch (err) {
            console.error('Unexpected error in loadStore:', err);
        } finally {
            setLoading(false);
        }
    }

    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'Todos' || p.category === category;
        return matchSearch && matchCategory;
    });

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const waLink = profile?.whatsapp
        ? `https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}?text=Olá! Vim pelo catálogo online e gostaria de saber mais.`
        : '#';

    if (loading) {
        return (
            <div className="min-h-screen bg-mint/30 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-mint/30 flex items-center justify-center flex-col gap-2 p-4 text-center">
                <Leaf size={40} className="text-forest/30" />
                <p className="text-forest/60 font-medium">Loja não encontrada.</p>
                <p className="text-forest/30 text-xs">O link "{companyId}" não existe ou os dados estão protegidos.</p>
                <Link href="/" className="mt-4 text-forest/60 underline text-sm font-medium hover:text-forest transition-colors">Voltar ao início</Link>
            </div>
        );
    }

    return (
        <CartProvider>
            <div className="min-h-screen bg-mint/30 pb-12">
                {/* Header */}
                <header className="bg-white border-b border-mint-dark pt-12 pb-8 px-4 rounded-b-[2.5rem] shadow-sm relative z-10">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-mint-dark overflow-hidden mb-4 shadow-md ring-4 ring-white border border-mint">
                            <img src={profile.logo_url || FALLBACK_LOGO} alt={profile.store_name} className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-forest mb-2">{profile.store_name}</h1>
                        {profile.description && (
                            <p className="text-forest/60 max-w-lg mb-6 text-sm leading-relaxed">
                                {profile.description}
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-3 w-full max-w-sm px-4 sm:px-0">
                            <a href={waLink} target="_blank" rel="noopener noreferrer"
                                style={{ backgroundColor: profile.brand_color || '#a8e63d' }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-forest font-bold hover:opacity-90 transition-all shadow-sm active:scale-95 text-sm">
                                <MessageCircle size={18} />
                                Fale Conosco
                            </a>
                            <Link href={`/c/${companyId}/pedidos`}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-mint/50 border border-mint-dark text-forest font-bold hover:bg-mint transition-colors shadow-sm active:scale-95 text-sm">
                                <PackageSearch size={18} />
                                Meus Pedidos
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 pt-8">
                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl p-4 shadow-card border border-mint-dark mb-8 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={18} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/50 border border-mint-dark/50 text-forest placeholder:text-forest/40 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        <div className="relative min-w-[160px]">
                            <select value={category} onChange={(e) => setCategory(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-mint/50 border border-mint-dark/50 text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer transition-all">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/50 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {filtered.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-forest/50 bg-white rounded-3xl border border-dashed border-mint-dark">
                                <Leaf size={48} className="mx-auto mb-4 text-forest/20" />
                                <p className="font-medium text-lg text-forest/60">Nenhum produto encontrado</p>
                                <p className="text-sm">Tente ajustar sua busca ou categoria.</p>
                            </div>
                        ) : (
                            filtered.map((product) => (
                                <ProductCard key={product.id} product={product} formatPrice={formatPrice} brandColor={profile.brand_color} />
                            ))
                        )}
                    </div>
                </main>

                <CartDrawer profileId={profile.id} whatsapp={profile.whatsapp} brandColor={profile.brand_color} />
            </div>
        </CartProvider>
    );
}

function ProductCard({ product, formatPrice, brandColor }: { product: Product; formatPrice: (v: number) => string; brandColor?: string }) {
    const { addToCart } = useCart();
    return (
        <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-card border border-mint-dark hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <Link href={`/p/${product.id}`} className="block relative aspect-square overflow-hidden bg-mint-dark">
                <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {product.status === 'esgotado' && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">Esgotado</span>
                    </div>
                )}
            </Link>
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/p/${product.id}`} className="hover:underline decoration-forest/30">
                    <h3 className="font-semibold text-forest text-sm sm:text-base leading-tight mb-0.5 line-clamp-2">{product.name}</h3>
                </Link>
                <p className="text-[10px] uppercase tracking-wider font-mono text-forest/40 mb-2">REF: #{product.id.substring(0, 8).toUpperCase()}</p>
                {product.category && <p className="text-forest/40 text-xs mb-3">{product.category}</p>}
                <div className="mt-auto">
                    <p className="text-lg sm:text-xl font-extrabold text-forest mb-3">{formatPrice(product.price)}</p>
                    {product.status !== 'esgotado' && (
                        <button
                            onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, category: product.category, status: product.status as any, description: product.description, whatsapp: '', tags: product.tags })}
                            style={{ backgroundColor: brandColor || '#a8e63d' }}
                            className="w-full py-2 rounded-xl text-forest font-bold text-sm hover:opacity-90 transition-all active:scale-95">
                            + Adicionar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

