'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Leaf, MessageCircle, ChevronLeft, Tag, Boxes, ShoppingCart, Check } from 'lucide-react';
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

    // Customization selection state
    const [customizationChoice, setCustomizationChoice] = useState<'none' | 'with' | null>(null);
    const [selectedCustomizations, setSelectedCustomizations] = useState<Set<number>>(new Set());
    const [showValidationError, setShowValidationError] = useState(false);

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
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                            {status.label}
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

                    {/* Personalizações - Interactive Selection */}
                    {product.wholesale_customizations && product.wholesale_customizations.length > 0 && (
                        <div data-customization-section className={`rounded-2xl p-4 border mb-4 transition-colors ${showValidationError && customizationChoice === null ? 'bg-red-50/50 border-red-300 animate-pulse' : 'bg-amber-50/80 border-amber-200'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Tag size={15} className="text-amber-700" />
                                </div>
                                <div>
                                    <p className="font-semibold text-amber-900 text-sm">Personalização</p>
                                    <p className="text-[11px] text-amber-700/50">Selecione uma opção obrigatória</p>
                                </div>
                            </div>

                            {/* Com ou Sem */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => { setCustomizationChoice('none'); setSelectedCustomizations(new Set()); setShowValidationError(false); }}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all ${customizationChoice === 'none' ? 'bg-white border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-300' : 'bg-white/60 border-amber-200 text-forest/50 hover:border-amber-300'}`}
                                >
                                    {customizationChoice === 'none' && <Check size={13} className="text-amber-600 flex-shrink-0" />}
                                    Sem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomizationChoice('with');
                                        setSelectedCustomizations(new Set(product!.wholesale_customizations.map((_, i) => i)));
                                        setShowValidationError(false);
                                    }}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all ${customizationChoice === 'with' ? 'bg-amber-400 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-300' : 'bg-white/60 border-amber-200 text-forest/50 hover:border-amber-300'}`}
                                >
                                    {customizationChoice === 'with' && <Check size={13} className="flex-shrink-0" />}
                                    Com
                                </button>
                            </div>

                            {/* Customization options - shown when "with" selected */}
                            {customizationChoice === 'with' && (
                                <div className="space-y-2 mt-3 pt-3 border-t border-amber-200/50">
                                    <p className="text-[11px] text-amber-700/60 font-medium mb-1">Escolha as personalizações desejadas:</p>
                                    {product.wholesale_customizations.map((c, idx) => {
                                        const isChecked = selectedCustomizations.has(idx);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    const newSet = new Set(selectedCustomizations);
                                                    if (isChecked) newSet.delete(idx); else newSet.add(idx);
                                                    // Must have at least 1 if choosing 'with'
                                                    if (newSet.size === 0) setCustomizationChoice('none');
                                                    setSelectedCustomizations(newSet);
                                                }}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-white border-amber-300 shadow-sm' : 'bg-white/40 border-amber-100 hover:bg-white/70 hover:border-amber-200'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'border-amber-500 bg-amber-400' : 'border-amber-200 bg-white'}`}>
                                                        {isChecked && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className={`text-sm font-medium ${isChecked ? 'text-forest' : 'text-forest/50'}`}>{c.name}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${isChecked ? 'text-amber-700' : 'text-forest/40'}`}>+ {formatPrice(c.price)} /unid</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {showValidationError && customizationChoice === null && (
                                <p className="text-red-500 text-xs font-semibold mt-2 text-center">⚠ Selecione se deseja com ou sem personalização</p>
                            )}
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
                                    const hasCustomizations = product.wholesale_customizations && product.wholesale_customizations.length > 0;
                                    if (hasCustomizations && customizationChoice === null) {
                                        setShowValidationError(true);
                                        // Scroll to customization section
                                        document.querySelector('[data-customization-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        return;
                                    }
                                    // Build the product with selected customizations embedded
                                    const enrichedProduct = {
                                        ...product,
                                        wholesale_customizations: customizationChoice === 'with'
                                            ? product.wholesale_customizations.filter((_: any, i: number) => selectedCustomizations.has(i))
                                            : [],
                                    };
                                    addToCart(enrichedProduct, product.wholesale_min_qty || 1);
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
