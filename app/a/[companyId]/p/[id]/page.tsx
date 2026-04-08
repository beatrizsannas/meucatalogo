'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Leaf, MessageCircle, ChevronLeft, Tag, Boxes, ShoppingCart } from 'lucide-react';
import { useWholesaleCart } from '@/app/context/WholesaleCartContext';
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
    profile_id: string;
    wholesale_price: number | null;
    wholesale_min_qty: number | null;
    wholesale_label: boolean;
    wholesale_label_price: number | null;
    wholesale_customizations: { name: string; price: number }[];
};

type Profile = {
    id: string;
    store_name: string;
    logo_url: string;
    slug: string;
    description: string;
    whatsapp: string;
    brand_color: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
    'em-estoque': { label: 'Em Estoque', color: 'bg-amber-100 text-amber-800' },
    'ativo': { label: 'Disponível', color: 'bg-amber-100 text-amber-800' },
    'baixo-estoque': { label: 'Baixo Estoque', color: 'bg-yellow-100 text-yellow-800' },
    'esgotado': { label: 'Esgotado', color: 'bg-red-50 text-red-600' },
    'inativo': { label: 'Indisponível', color: 'bg-gray-100 text-gray-500' },
};

export default function WholesaleProductPage() {
    const params = useParams();
    const companyId = params?.companyId as string;
    const id = params?.id as string;
    const { addToCart, setIsCartOpen, cartCount } = useWholesaleCart();

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

        const { data: prof } = await supabase
            .from('profiles')
            .select('id, store_name, logo_url, slug, description, whatsapp, brand_color')
            .eq('id', prod.profile_id)
            .single();
        setProfile(prof);
        setLoading(false);
    }

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const backUrl = `/a/${companyId}`;

    const waLink = profile?.whatsapp
        ? `https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}?text=Olá! Vim pelo Catálogo Atacado e tenho interesse no produto: ${product?.name}`
        : '#';

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!product || !product.wholesale_price) {
        return (
            <div className="min-h-screen bg-amber-50/40 flex flex-col items-center justify-center gap-3">
                <Boxes size={40} className="text-amber-300" />
                <p className="text-amber-800/60 font-medium">Produto não disponível no atacado.</p>
                <Link href={backUrl} className="text-sm text-amber-700 underline">Voltar ao catálogo atacado</Link>
            </div>
        );
    }

    const status = statusLabels[product.status] ?? { label: product.status, color: 'bg-gray-100 text-gray-600' };
    const isUnavailable = product.status === 'esgotado' || product.status === 'inativo';

    return (
        <div className="min-h-screen bg-amber-50/40 pb-28">
            {/* Top Nav */}
            <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200">
                <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <Link href={backUrl} className="flex items-center gap-1.5 text-amber-800/70 hover:text-amber-900 text-sm font-medium transition-colors">
                        <ChevronLeft size={16} />
                        Voltar ao catálogo atacado
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center text-amber-700 hover:bg-amber-100 rounded-full transition-colors">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                            <Boxes size={13} className="text-amber-700" />
                            <span className="font-bold text-amber-800 text-xs uppercase tracking-widest">Atacado</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
                {/* Hero Image */}
                <div className="relative w-full aspect-square max-h-[400px] rounded-3xl overflow-hidden shadow-sm mb-6 bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                            {status.label}
                        </span>
                        <span className="bg-amber-400 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                            Atacado
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 mb-4">
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

                    {/* Preço atacado em destaque */}
                    <div className="bg-amber-50 rounded-2xl px-5 py-4 mb-4 border border-amber-200">
                        <p className="text-xs text-amber-700/70 font-medium mb-0.5">Preço Atacado</p>
                        <p className="text-4xl font-extrabold text-amber-700 tracking-tight">
                            {formatPrice(product.wholesale_price)}
                        </p>
                        {product.wholesale_min_qty && (
                            <p className="text-sm text-amber-700/60 mt-1 font-medium">
                                Pedido mínimo: {product.wholesale_min_qty} unidades
                            </p>
                        )}
                    </div>

                    {/* Personalizações */}
                    {product.wholesale_customizations && product.wholesale_customizations.length > 0 && (
                        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Tag size={15} className="text-amber-700" />
                                </div>
                                <p className="font-semibold text-amber-900 text-sm">Personalizações disponíveis</p>
                            </div>
                            <div className="space-y-2">
                                {product.wholesale_customizations.map((c, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                                        <span className="text-sm text-forest font-medium">{c.name}</span>
                                        <span className="text-sm text-amber-700 font-bold">+ {formatPrice(c.price)} /unid</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-amber-700/50 text-xs mt-2">Selecione no carrinho ao adicionar o produto</p>
                        </div>
                    )}

                    {product.description && (
                        <div>
                            <h2 className="font-bold text-forest text-sm mb-2">Descrição</h2>
                            <p className="text-forest/60 text-sm leading-relaxed">{product.description}</p>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-4">
                        <h2 className="font-bold text-forest text-sm mb-3">Características</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Store Info */}
                {profile && (
                    <Link href={backUrl} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 flex items-center gap-4 cursor-pointer hover:bg-amber-50/50 transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-amber-200 shadow-sm">
                            {profile.logo_url ? (
                                <img src={profile.logo_url} alt={profile.store_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-amber-700/40 font-bold text-lg">{profile.store_name?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-forest text-sm">{profile.store_name}</p>
                            <p className="text-forest/40 text-xs mt-0.5">Ver catálogo atacado completo</p>
                        </div>
                        <ChevronLeft size={16} className="text-amber-400 rotate-180 flex-shrink-0" />
                    </Link>
                )}
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-white/90 backdrop-blur-md border-t border-amber-200 px-4 py-4">
                    <div className="max-w-2xl mx-auto">
                        {isUnavailable ? (
                            <button disabled className="w-full flex items-center justify-center gap-2.5 bg-gray-100 text-gray-400 font-bold py-4 rounded-full text-base cursor-not-allowed">
                                Produto Indisponível
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    addToCart(product, product.wholesale_min_qty || 1);
                                    setIsCartOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-2.5 bg-amber-400 text-amber-900 font-bold py-4 rounded-full text-base hover:bg-amber-500 active:scale-95 transition-all duration-200 shadow-sm border border-amber-500"
                            >
                                <ShoppingCart size={20} />
                                Adicionar ao Carrinho
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Cart Drawer */}
            {profile && (
                <WholesaleCartDrawer 
                    profileId={profile.id} 
                    whatsapp={profile.whatsapp} 
                />
            )}
        </div>
    );
}
