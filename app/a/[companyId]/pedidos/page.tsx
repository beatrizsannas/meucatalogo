'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PackageSearch, ChevronLeft, Search, Package, Tag, ChevronDown } from 'lucide-react';
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
    'confirmado': { bg: 'bg-amber-200', text: 'text-forest', label: 'Confirmado' },
    'em-preparacao': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Preparação' },
    'enviado': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Enviado' },
    'cancelado': { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelado' },
};

// CPF/CNPJ and phone format helpers
function formatCNPJCPF(value: string) {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
        return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return v
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
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
        if (rawCPF.length < 11) { setError('CNPJ ou CPF inválido.'); return; }
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
        <div className="min-h-screen bg-amber-50/40 px-4 py-10">
            <div className="max-w-xl mx-auto">
                {/* Back link */}
                <Link href={`/a/${companyId}`} className="inline-flex items-center gap-2 text-forest/60 hover:text-forest text-sm font-semibold mb-6 transition-colors">
                    <ChevronLeft size={18} /> Voltar ao catálogo
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500 shadow-sm">
                        <PackageSearch size={28} className="text-amber-900" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-forest">Meus Pedidos de Atacado</h1>
                    <p className="text-forest/60 text-sm mt-1">Consulte seus pedidos com CNPJ/CPF e telefone.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-amber-200 p-6 sm:p-8 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-forest mb-1.5">CNPJ ou CPF *</label>
                            <input type="text" value={cpf} onChange={(e) => setCPF(formatCNPJCPF(e.target.value))} maxLength={18}
                                placeholder="00.000.000/0001-00" required
                                className="w-full px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-forest mb-1.5">Telefone / WhatsApp *</label>
                            <input type="text" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15}
                                placeholder="(11) 99999-9999" required
                                className="w-full px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-900 border border-amber-500 font-extrabold py-3 rounded-full hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-70 shadow-sm">
                            {loading ? <span className="w-4 h-4 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" /> : <Search size={16} />}
                            {loading ? 'Buscando...' : 'Buscar Pedidos'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {searched && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-amber-200 text-amber-900/40">
                                <Package size={40} className="mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Nenhum pedido encontrado.</p>
                                <p className="text-sm mt-0.5">Verifique o CNPJ ou CPF e telefone digitados.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-forest/60 text-sm font-medium pl-1">{orders.length} pedido(s) encontrado(s)</p>
                                {orders.map(order => {
                                    const status = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
                                    const orderItems = Array.isArray(order.items) ? order.items : [];
                                    const isExpanded = expandedOrderId === order.id;

                                    return (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden">
                                            {/* Faixa atacado */}
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 z-10" />

                                            <div 
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                className="p-5 pl-6 cursor-pointer hover:bg-amber-50/50 transition-colors relative"
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
                                                <div className="px-5 pl-6 pb-5 pt-4 bg-amber-50/50 border-t border-amber-100 relative">
                                                    <h4 className="text-xs font-bold text-forest mb-3">Itens do Pedido:</h4>
                                                    <div className="space-y-3">
                                                        {orderItems.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex gap-3 text-sm items-center bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-sm">
                                                                <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden flex-shrink-0">
                                                                    {item.image_url ? (
                                                                        <img src={item.image_url} alt={item.productName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="w-6 h-6 text-amber-900/20 m-3" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-forest font-semibold text-xs line-clamp-2 leading-tight">{item.productName}</p>
                                                                    <div className="flex items-center justify-between mt-1 pt-1">
                                                                        <span className="text-forest text-[11px]"><span className="font-extrabold text-amber-600 mr-1">{item.quantity}x</span></span>
                                                                        <span className="font-extrabold text-forest text-xs">{formatPrice(item.price * item.quantity)}</span>
                                                                    </div>
                                                                    {item.wholesale_label && item.wholesale_label_price && (
                                                                        <div className="flex items-center justify-between text-[10px] text-amber-700 mt-1 bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100/50">
                                                                            <span className="flex items-center gap-1 font-medium"><Tag size={10}/> Etiqueta p/ unidade</span>
                                                                            <span className="font-bold">+{formatPrice(item.wholesale_label_price * item.quantity)}</span>
                                                                        </div>
                                                                    )}
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
