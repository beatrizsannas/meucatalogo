'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CartProvider, useCart } from '@/app/context/CartContext';
import { Leaf, ShoppingCart, ChevronLeft, Tag } from 'lucide-react';

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    status: string;
    image_url: string;
    description: string;
    tags: string[];
    profile_id: string;
};

type Profile = {
    id: string;
    store_name: string;
    logo_url: string;
    slug: string;
    description: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
    'em-estoque': { label: 'Em Estoque', color: 'bg-lime/60 text-forest' },
    'ativo': { label: 'Disponível', color: 'bg-green-100 text-green-800' },
    'baixo-estoque': { label: 'Baixo Estoque', color: 'bg-yellow-100 text-yellow-800' },
    'esgotado': { label: 'Esgotado', color: 'bg-red-50 text-red-600' },
    'inativo': { label: 'Indisponível', color: 'bg-gray-100 text-gray-500' },
};

function ProductPage() {
    const params = useParams();
    const id = params?.id as string;
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadProduct();
    }, [id]);

    async function loadProduct() {
        const supabase = createClient();
        const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
        if (!prod) { setLoading(false); return; }
        setProduct(prod);

        const { data: prof } = await supabase.from('profiles').select('id, store_name, logo_url, slug, description').eq('id', prod.profile_id).single();
        setProfile(prof);
        setLoading(false);
    }

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return (
            <div className="min-h-screen bg-mint flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-mint flex flex-col items-center justify-center gap-3">
                <Leaf size={40} className="text-forest/30" />
                <p className="text-forest/60 font-medium">Produto não encontrado.</p>
                <Link href="/" className="text-sm text-forest underline">Voltar</Link>
            </div>
        );
    }

    const status = statusLabels[product.status] ?? { label: product.status, color: 'bg-gray-100 text-gray-600' };
    const isUnavailable = product.status === 'esgotado' || product.status === 'inativo';
    const backUrl = profile?.slug ? `/c/${profile.slug}` : '/';

    return (
        <div className="min-h-screen bg-mint pb-28">
            {/* Top Nav */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-mint-dark">
                <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <Link href={backUrl} className="flex items-center gap-1.5 text-forest/60 hover:text-forest text-sm font-medium transition-colors">
                        <ChevronLeft size={16} />
                        Voltar ao catálogo
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center">
                            <Leaf size={14} className="text-forest" />
                        </div>
                        <span className="font-bold text-forest text-sm">Meu Catálogo</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
                {/* Hero Image */}
                <div className="relative w-full aspect-square max-h-80 rounded-3xl overflow-hidden shadow-card mb-6">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-3xl p-6 shadow-card border border-mint-dark mb-4">
                    <div className="flex flex-col mb-4">
                        <h1 className="text-2xl font-bold text-forest leading-tight mb-1">{product.name}</h1>
                        <p className="text-xs uppercase tracking-wider font-mono text-forest/40">
                            Ref: #{product.id.substring(0, 8).toUpperCase()}
                        </p>
                    </div>

                    {product.category && (
                        <p className="text-forest/50 text-sm mb-4 flex items-center gap-1.5">
                            <Tag size={13} />
                            {product.category}
                        </p>
                    )}

                    <div className="bg-mint rounded-2xl px-5 py-4 mb-5">
                        <p className="text-xs text-forest/40 font-medium mb-0.5">Preço</p>
                        <p className="text-4xl font-extrabold text-forest tracking-tight">{formatPrice(product.price)}</p>
                    </div>

                    {product.description && (
                        <div>
                            <h2 className="font-bold text-forest text-sm mb-2">Descrição</h2>
                            <p className="text-forest/60 text-sm leading-relaxed">{product.description}</p>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-card border border-mint-dark mb-4">
                        <h2 className="font-bold text-forest text-sm mb-3">Características</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1.5 rounded-full bg-mint border border-mint-dark text-forest text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Store Info */}
                {profile && (
                    <Link href={backUrl} className="bg-white rounded-2xl p-5 shadow-card border border-mint-dark flex items-center gap-4 cursor-pointer hover:bg-mint/30 transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-mint-dark flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                            {profile.logo_url ? (
                                <img src={profile.logo_url} alt={profile.store_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-forest/40 font-bold text-lg">{profile.store_name?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-forest text-sm">{profile.store_name}</p>
                            {profile.description && (
                                <p className="text-forest/40 text-xs line-clamp-1">{profile.description}</p>
                            )}
                        </div>
                        <ChevronLeft size={16} className="text-forest/30 rotate-180 flex-shrink-0" />
                    </Link>
                )}
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-white/80 backdrop-blur-md border-t border-mint-dark px-4 py-4">
                    <div className="max-w-2xl mx-auto">
                        {isUnavailable ? (
                            <button disabled className="w-full flex items-center justify-center gap-2.5 bg-gray-100 text-gray-400 font-bold py-4 rounded-full text-base cursor-not-allowed">
                                Produto Indisponível
                            </button>
                        ) : (
                            <button
                                onClick={() => addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image_url,
                                    category: product.category,
                                    status: product.status as any,
                                    description: product.description,
                                    whatsapp: '',
                                    tags: product.tags,
                                })}
                                className="w-full flex items-center justify-center gap-2.5 bg-lime text-forest font-bold py-4 rounded-full text-base hover:bg-lime-dark active:scale-95 transition-all duration-200 shadow-sm"
                            >
                                <ShoppingCart size={20} />
                                Adicionar ao Carrinho
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductPublicPage() {
    return (
        <CartProvider>
            <ProductPage />
        </CartProvider>
    );
}
