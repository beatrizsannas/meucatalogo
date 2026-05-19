'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Store, Instagram, X, ArrowRight } from 'lucide-react';

type Partner = {
    id: string;
    slug: string;
    store_name: string;
    logo_url: string;
    description: string;
    social_retail_instagram: string;
    social_retail_tiktok: string;
};

export default function ParceirosPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    useEffect(() => {
        async function fetchPartners() {
            const supabase = createClient();
            // Fetch profiles that have a store_name
            const { data, error } = await supabase
                .from('profiles')
                .select('id, slug, store_name, logo_url, description, social_retail_instagram, social_retail_tiktok')
                .not('store_name', 'is', null)
                .neq('store_name', '')
                .not('store_name', 'ilike', '%test store%')
                .not('store_name', 'ilike', '%loja teste bia%');

            if (!error && data) {
                setPartners(data as Partner[]);
            }
            setLoading(false);
        }
        fetchPartners();
    }, []);

    // Helper to format handle from URL
    const getHandle = (url: string) => {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname.replace(/\//g, '');
            if (path.startsWith('@')) path = path.substring(1);
            return '@' + path;
        } catch {
            return url;
        }
    };

    return (
        <div className="min-h-screen bg-mint font-jakarta selection:bg-lime/50 selection:text-forest text-forest">
            {/* --- HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shadow-sm group-hover:bg-forest/90 transition-colors">
                            <span className="text-lime font-black text-xl uppercase tracking-tighter">V</span>
                        </div>
                        <span className="font-bold text-forest text-lg tracking-tight hidden sm:block">
                            Minha Vitrine
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="px-4 py-2 text-forest/70 font-semibold text-sm hover:text-forest transition-colors hidden sm:block">
                            Início
                        </Link>
                        <Link href="/parceiros" className="px-4 py-2 text-forest/70 font-semibold text-sm hover:text-forest transition-colors hidden sm:block">
                            Nossos Parceiros
                        </Link>
                        <Link href="/login" className="px-4 py-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors hidden sm:block">
                            Entrar
                        </Link>
                        <Link href="/cadastro" className="px-5 py-2.5 bg-forest text-white rounded-full font-semibold text-sm shadow-md shadow-forest/20 hover:bg-forest/90 hover:-translate-y-0.5 transition-all">
                            Criar Vitrine Grátis
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="px-4 pt-32 pb-16 w-full flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-mint-dark/50 shadow-sm mb-6">
                    <Store size={14} className="text-lime" />
                    <span className="text-xs font-semibold text-forest/80 uppercase tracking-wider">Lojas Cadastradas</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-forest tracking-tight leading-[1.1] mb-4">
                    Nossos Parceiros
                </h1>
                <p className="text-lg text-forest/60 max-w-2xl mx-auto font-medium">
                    Conheça as lojas que já estão revolucionando suas vendas com o Minha Vitrine.
                </p>
            </section>

            {/* --- GRID --- */}
            <section className="px-4 pb-32 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-mint-dark/50 shadow-sm">
                        <Store size={48} className="text-forest/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-forest mb-2">Ainda não temos parceiros visíveis</h3>
                        <p className="text-forest/60">Seja o primeiro a criar sua vitrine!</p>
                        <Link href="/cadastro" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-lime text-forest font-bold rounded-full hover:bg-lime/90 transition-colors">
                            Começar agora <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-5">
                        {partners.map(partner => (
                            <button
                                key={partner.id}
                                onClick={() => setSelectedPartner(partner)}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-mint-dark/50 hover:shadow-md hover:border-lime/50 transition-all text-left group flex flex-col items-center justify-center min-h-[200px] w-full sm:w-[240px]"
                            >
                                <div className="w-16 h-16 rounded-full border border-mint-dark overflow-hidden mb-3 bg-white flex items-center justify-center ring-4 ring-transparent group-hover:ring-lime/20 transition-all">
                                    {partner.logo_url ? (
                                        <img src={partner.logo_url} alt={partner.store_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-forest/30 font-bold text-3xl uppercase">{partner.store_name[0]}</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-forest text-center line-clamp-2">{partner.store_name}</h3>
                                <p className="text-xs text-forest/50 mt-2 font-medium">Ver detalhes &rarr;</p>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* --- MODAL --- */}
            {selectedPartner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-forest/80 backdrop-blur-sm animate-in fade-in duration-200" 
                        onClick={() => setSelectedPartner(null)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Banner */}
                        <div className="h-12 relative">
                            <button 
                                onClick={() => setSelectedPartner(null)}
                                className="absolute top-4 right-4 w-8 h-8 bg-mint/50 hover:bg-mint rounded-full flex items-center justify-center text-forest transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="px-6 pb-8 text-center">
                            <div className="w-20 h-20 mx-auto rounded-full border border-mint-dark overflow-hidden mb-4 bg-white shadow-sm flex items-center justify-center">
                                {selectedPartner.logo_url ? (
                                    <img src={selectedPartner.logo_url} alt={selectedPartner.store_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-forest/30 font-bold text-4xl uppercase">{selectedPartner.store_name[0]}</span>
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-bold text-forest mb-1">{selectedPartner.store_name}</h2>
                            <span className="inline-block px-3 py-1 bg-mint-dark/20 text-forest/70 text-[10px] font-bold uppercase tracking-wider rounded-full mb-6">
                                Loja Parceira
                            </span>

                            <div className="bg-mint/30 rounded-2xl p-4 text-sm text-forest/80 mb-6 text-left border border-mint-dark/50">
                                <p className="font-semibold text-forest mb-1">Sobre a Loja</p>
                                <p className="leading-relaxed">
                                    {selectedPartner.description || "Esta loja ainda não adicionou uma descrição ao seu perfil."}
                                </p>
                            </div>

                            {(selectedPartner.social_retail_instagram || selectedPartner.social_retail_tiktok) ? (
                                <div className="space-y-3 mb-6">
                                    <p className="text-xs font-bold text-forest/50 uppercase tracking-widest text-left">Redes Sociais</p>
                                    {selectedPartner.social_retail_instagram && (
                                        <a href={selectedPartner.social_retail_instagram} target="_blank" rel="noopener noreferrer" 
                                           className="flex items-center justify-between p-3 rounded-xl border border-mint-dark hover:border-lime hover:bg-lime/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                                                    <Instagram size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs text-forest/50 font-semibold">Instagram</p>
                                                    <p className="text-sm font-bold text-forest">{getHandle(selectedPartner.social_retail_instagram)}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-forest/30 group-hover:text-lime transition-colors" />
                                        </a>
                                    )}
                                    {selectedPartner.social_retail_tiktok && (
                                        <a href={selectedPartner.social_retail_tiktok} target="_blank" rel="noopener noreferrer"
                                           className="flex items-center justify-between p-3 rounded-xl border border-mint-dark hover:border-lime hover:bg-lime/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 text-black flex items-center justify-center">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.15 4.39-2.9 5.82-1.74 1.43-4.04 2.1-6.28 1.83-2.22-.27-4.24-1.39-5.65-3.11-1.41-1.71-2.07-4-1.89-6.22.18-2.21 1.25-4.25 2.92-5.67 1.67-1.42 3.91-2.06 6.1-1.78v4.06c-1.21-.11-2.45.18-3.41.92-.95.74-1.52 1.88-1.56 3.1-.03 1.2.46 2.37 1.34 3.17.88.8 2.1 1.2 3.3.1.2-.02.4-.04.59-.06.72-.08 1.42-.39 1.95-.91.53-.52.83-1.23.85-1.97.04-5.24.02-10.49.02-15.73z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs text-forest/50 font-semibold">TikTok</p>
                                                    <p className="text-sm font-bold text-forest">{getHandle(selectedPartner.social_retail_tiktok)}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-forest/30 group-hover:text-lime transition-colors" />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-forest/40 italic mb-6">Nenhuma rede social cadastrada.</p>
                            )}

                            <Link 
                                href={`/v/${selectedPartner.slug || selectedPartner.id}`}
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-forest text-lime font-bold rounded-xl hover:bg-forest/90 hover:-translate-y-0.5 transition-all shadow-md shadow-forest/10"
                            >
                                <Store size={18} />
                                Acessar Catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
