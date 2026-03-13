'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, User, Calendar, MapPin, Package as PackageIcon, Phone } from 'lucide-react';

type OrderItem = {
    productId?: string;
    productName: string;
    price: number;
    quantity: number;
};

type Order = {
    id: string;
    customer_name: string;
    customer_cpf: string;
    customer_phone: string;
    customer_address: string;
    items: OrderItem[];
    total: number;
    status: string;
    date: string;
    code: string;
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
    'confirmado': { bg: 'bg-lime', text: 'text-forest', label: 'Confirmado' },
    'em-preparacao': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Preparação' },
    'enviado': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enviado' },
    'cancelado': { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelado' },
    'entregue': { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregue' },
};

export default function VerPedidoPage() {
    const params = useParams();
    const id = params?.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadOrder();
    }, [id]);

    async function loadOrder() {
        const supabase = createClient();
        const { data } = await supabase.from('orders').select('*').eq('id', id).single();
        setOrder(data);
        setLoading(false);
    }

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) {
        return (
            <div className="flex min-h-screen bg-mint">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen bg-mint">
                <Sidebar />
                <main className="flex-1 p-8 flex flex-col items-center justify-center gap-3">
                    <PackageIcon size={40} className="text-forest/30" />
                    <p className="text-forest/60 font-medium">Pedido não encontrado.</p>
                    <Link href="/pedidos" className="text-sm text-forest underline">Voltar para pedidos</Link>
                </main>
            </div>
        );
    }

    const style = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

    return (
        <div className="flex min-h-screen bg-mint/50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/pedidos" className="w-10 h-10 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest/60 hover:text-forest hover:bg-mint transition-colors shadow-sm">
                                <ChevronLeft size={20} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-forest">Pedido {order.code || order.id.substring(0, 8).toUpperCase()}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>{style.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-forest/50 text-sm mt-1">
                                    <Calendar size={14} />
                                    <span>Realizado em {order.date ? formatDate(order.date) : 'Data indisponível'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-forest">
                                        <PackageIcon size={16} />
                                    </div>
                                    <h2 className="text-lg font-bold text-forest">Itens do Pedido</h2>
                                </div>
                                <div className="divide-y divide-mint-dark">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-forest text-sm">{item.productName}</p>
                                                {item.productId && (
                                                    <p className="text-[10px] uppercase tracking-wider font-mono text-forest/40 mt-0.5">REF: #{item.productId.substring(0, 8).toUpperCase()}</p>
                                                )}
                                                <p className="text-forest/60 text-xs mt-0.5">{formatPrice(item.price)} cada</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-forest font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                                                <p className="text-forest/60 text-xs mt-0.5">Qtd: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-dashed border-mint-dark">
                                    <div className="flex items-center justify-between text-forest/60 text-sm mb-4">
                                        <span>Frete</span>
                                        <span>A combinar</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-forest font-bold text-base">Total do Pedido</span>
                                        <span className="text-forest font-extrabold text-xl">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                <h3 className="text-sm font-bold text-forest/50 uppercase tracking-wider mb-4">Cliente</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-mint-dark flex items-center justify-center text-forest/50">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-forest text-sm">{order.customer_name}</p>
                                        {order.customer_cpf && <p className="text-forest/50 text-xs mt-0.5">CPF: {order.customer_cpf}</p>}
                                    </div>
                                </div>
                                {order.customer_phone && (
                                    <div className="flex items-center gap-2 text-forest/60 text-sm mb-4">
                                        <Phone size={14} />
                                        <span>{order.customer_phone}</span>
                                    </div>
                                )}
                                {order.customer_phone && (
                                    <a
                                        href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full block text-center bg-mint text-forest text-sm font-bold py-2.5 rounded-xl hover:bg-mint-dark transition-colors"
                                    >
                                        Abrir WhatsApp
                                    </a>
                                )}
                            </div>

                            {order.customer_address ? (
                                <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin size={16} className="text-forest/50" />
                                        <h3 className="text-sm font-bold text-forest/50 uppercase tracking-wider">Endereço</h3>
                                    </div>
                                    <p className="text-forest text-sm leading-relaxed">{order.customer_address}</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6 text-center text-forest/50 text-sm">
                                    <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Endereço não informado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
