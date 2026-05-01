'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PackageSearch, ChevronLeft, Search, Package, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Order = {
    id: string;
    date: string;
    status: string;
    total: number;
    items: { productName: string; quantity: number; price: number }[];
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
    'confirmado': { bg: 'bg-lime/30', text: 'text-forest', label: 'Confirmado' },
    'em-preparacao': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Preparação' },
    'enviado': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enviado' },
    'cancelado': { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelado' },
};

// CPF and phone format helpers
function formatCPF(value: string) {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
        return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value.substring(0, 14);
}
function formatPhone(value: string) {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
        if (v.length <= 2) return v.replace(/(\d{2})/, '($1');
        if (v.length <= 6) return v.replace(/(\d{2})(\d{4})/, '($1) $2');
        if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value.substring(0, 15);
}

export default function PedidosClientePage() {
    const params = useParams();
    const companyId = params?.companyId as string;

    const [cpf, setCPF] = useState('');
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const rawCPF = cpf.replace(/\D/g, '');
        const rawPhone = phone.replace(/\D/g, '');
        if (rawCPF.length !== 11) { setError('CPF inválido. Digite os 11 dígitos.'); return; }
        if (rawPhone.length < 10) { setError('Telefone inválido.'); return; }
        setLoading(true);

        const supabase = createClient();
        // First get the profile by slug to know which store
        const { data: profile } = await supabase.from('profiles').select('id').eq('slug', companyId).maybeSingle();
        if (!profile) { setError('Loja não encontrada.'); setLoading(false); return; }

        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('profile_id', profile.id)
            .or(`customer_cpf.eq.${rawCPF},customer_cpf.eq.${cpf}`)
            .eq('customer_phone', rawPhone)
            .order('date', { ascending: false });

        setOrders(data || []);
        setSearched(true);
        setLoading(false);
    };

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-mint/30 px-4 py-10">
            <div className="max-w-xl mx-auto">
                {/* Back link */}
                <Link href={`/v/${companyId}`} className="inline-flex items-center gap-2 text-forest/60 hover:text-forest text-sm font-semibold mb-6 transition-colors">
                    <ChevronLeft size={18} /> Voltar ao catálogo
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PackageSearch size={28} className="text-forest" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-forest">Meus Pedidos</h1>
                    <p className="text-forest/60 text-sm mt-1">Consulte seus pedidos com CPF e telefone.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6 sm:p-8 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-forest mb-1.5">CPF *</label>
                            <input type="text" value={cpf} onChange={(e) => setCPF(formatCPF(e.target.value))} maxLength={14}
                                placeholder="000.000.000-00" required
                                className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-forest mb-1.5">Telefone / WhatsApp *</label>
                            <input type="text" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15}
                                placeholder="(11) 99999-9999" required
                                className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-bold py-3 rounded-full hover:bg-lime-dark transition-all active:scale-95 disabled:opacity-70">
                            {loading ? <span className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" /> : <Search size={16} />}
                            {loading ? 'Buscando...' : 'Buscar Pedidos'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {searched && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-mint-dark text-forest/50">
                                <Package size={40} className="mx-auto mb-3 text-forest/20" />
                                <p className="font-medium">Nenhum pedido encontrado.</p>
                                <p className="text-sm mt-0.5">Verifique o CPF e telefone digitados.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-forest/60 text-sm font-medium pl-1">{orders.length} pedido(s) encontrado(s)</p>
                                {orders.map(order => {
                                    const status = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
                                    const orderItems = Array.isArray(order.items) ? order.items : [];
                                    const isExpanded = expandedOrderId === order.id;
                                    
                                    return (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-card border border-mint-dark overflow-hidden">
                                            <div 
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                className="p-5 cursor-pointer hover:bg-mint/5 transition-colors flex flex-col relative"
                                            >
                                                <div className="absolute top-5 right-5">
                                                    <ChevronDown className={`text-forest/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={20} />
                                                </div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-extrabold text-forest">{order.id}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>{status.label}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-forest/50 text-xs">{formatDate(order.date)}</p>
                                                    <span className="font-extrabold text-forest pr-8">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-5 pb-5 border-t border-mint-dark/50 pt-4 bg-mint/5">
                                                    <h4 className="text-xs font-bold text-forest mb-3">Itens do Pedido:</h4>
                                                    <div className="space-y-3">
                                                        {orderItems.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex gap-3 text-sm items-center bg-white p-2 rounded-xl border border-mint-dark/50 shadow-sm">
                                                                <div className="w-12 h-12 rounded-lg bg-mint/50 border border-mint-dark overflow-hidden flex-shrink-0">
                                                                    {item.image_url ? (
                                                                        <img src={item.image_url} alt={item.productName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="w-6 h-6 text-forest/30 m-3" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-forest font-medium text-xs line-clamp-2">{item.productName}</p>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <span className="text-forest/60 text-xs"><span className="font-bold text-forest">{item.quantity}x</span></span>
                                                                        <span className="font-bold text-forest text-xs">{formatPrice(item.price * item.quantity)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
