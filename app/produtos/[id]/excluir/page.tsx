'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { ChevronLeft, Trash2, AlertTriangle } from 'lucide-react';
import { products } from '@/app/data/products';

export default function ExcluirProdutoPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const product = products.find(p => p.id === params.id);

    if (!product) {
        if (typeof window !== 'undefined') router.push('/produtos');
        return null;
    }

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        // Simulate API delete
        setTimeout(() => {
            setIsDeleting(false);
            router.push('/produtos');
            router.refresh();
        }, 800);
    };

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />

            <main className="flex-1 p-8 overflow-auto flex items-start justify-center pt-20">
                <div className="max-w-md w-full">

                    <div className="mb-6">
                        <Link
                            href="/produtos"
                            className="inline-flex items-center gap-2 text-forest/60 hover:text-forest text-sm font-semibold transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Voltar para Produtos
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-card border border-mint-dark overflow-hidden p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-forest mb-2">Excluir Produto?</h1>
                        <p className="text-forest/60 text-sm mb-8 text-balance">
                            Tem certeza que deseja excluir este produto do seu catálogo? Esta ação não poderá ser desfeita.
                        </p>

                        <div className="bg-mint/30 rounded-2xl p-4 flex items-center gap-4 text-left border border-mint-dark mb-8">
                            <div className="w-16 h-16 rounded-xl bg-mint-dark overflow-hidden flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-forest text-sm line-clamp-1">{product.name}</p>
                                <p className="text-forest/50 text-xs mb-1">{product.category}</p>
                                <p className="font-extrabold text-forest text-sm">{formatPrice(product.price)}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Produto'}
                            </button>
                            <Link
                                href="/produtos"
                                className="w-full px-6 py-3.5 rounded-full text-forest text-sm font-bold hover:bg-mint transition-colors"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
