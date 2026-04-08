'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import { Search, ChevronDown, SlidersHorizontal, Eye } from 'lucide-react';
import Link from 'next/link';
import CustomSelect from '@/app/components/CustomSelect';

const statuses = ['Todos', 'Pendente', 'Confirmado', 'Em Preparação', 'Enviado', 'Cancelado'];
const statusMap: Record<string, string> = {
    'Pendente': 'pendente', 'Confirmado': 'confirmado',
    'Em Preparação': 'em-preparacao', 'Enviado': 'enviado', 'Cancelado': 'cancelado'
};
const ITEMS_PER_PAGE = 10;

type Order = {
    id: string; date: string; customer_name: string; customer_phone: string;
    items: { productName: string; quantity: number; price: number }[];
    total: number; status: string;
};

function StatusSelect({ order, onUpdate }: { order: Order; onUpdate: (id: string, s: string) => void }) {
    const cls: Record<string, string> = {
        'pendente': 'bg-yellow-50 border-yellow-200 text-yellow-700',
        'confirmado': 'bg-lime border-lime-dark text-forest',
        'em-preparacao': 'bg-blue-50 border-blue-200 text-blue-700',
        'enviado': 'bg-purple-50 border-purple-200 text-purple-700',
        'cancelado': 'bg-red-50 border-red-200 text-red-600',
    };
    const options = [
        { value: 'pendente', label: 'Pendente' },
        { value: 'confirmado', label: 'Confirmado' },
        { value: 'em-preparacao', label: 'Em Preparação' },
        { value: 'enviado', label: 'Enviado' },
        { value: 'cancelado', label: 'Cancelado' }
    ];
    return (
        <div className="relative inline-block w-40">
            <CustomSelect
                value={order.status}
                onChange={(val) => onUpdate(order.id, val)}
                options={options}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none transition-colors ${cls[order.status] || ''}`}
            />
        </div>
    );
}

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [page, setPage] = useState(1);

    useEffect(() => { loadOrders(); }, []);

    async function loadOrders() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('orders').select('*').eq('profile_id', user.id).order('date', { ascending: false });
        setOrders(data || []);
        setLoading(false);
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const filtered = orders.filter((o) => {
        const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'Todos' || o.status === statusMap[statusFilter];
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex min-h-screen bg-mint relative">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-forest">Pedidos</h1>
                        <p className="text-forest/50 text-sm mt-0.5">Acompanhe todos os pedidos recebidos através do seu catálogo.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-card border border-mint-dark mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-52">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Buscar por código ou cliente..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                        </div>
                        <CustomSelect
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setPage(1); }}
                            options={statuses.map(s => ({ value: s, label: `Status: ${s}` }))}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-mint-dark">
                    {loading ? (
                        <div className="py-16 text-center text-forest/40 text-sm">Carregando pedidos...</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-mint-dark bg-mint/10">
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-4">Pedido</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Data</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Cliente / Itens</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Total</th>
                                    <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-4">Status</th>
                                    <th className="text-right text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-mint-dark">
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-forest/40 text-sm">Nenhum pedido encontrado.</td></tr>
                                ) : (
                                    paginated.map(order => {
                                        const items = Array.isArray(order.items) ? order.items : [];
                                        return (
                                            <tr key={order.id} className="hover:bg-mint/40 transition-colors">
                                                <td className="px-6 py-4"><p className="font-bold text-forest text-sm">{order.id}</p></td>
                                                <td className="px-4 py-4"><p className="text-forest/60 text-sm whitespace-nowrap">{formatDate(order.date)}</p></td>
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-forest text-sm">{order.customer_name}</p>
                                                    <p className="text-forest/50 text-xs mt-0.5 max-w-[200px] truncate">
                                                        {items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4"><p className="text-forest font-bold text-sm">{formatPrice(order.total)}</p></td>
                                                <td className="px-4 py-4"><StatusSelect order={order} onUpdate={handleStatusUpdate} /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/pedidos/${order.id}`} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:bg-mint hover:text-forest transition-colors" title="Ver Detalhes">
                                                            <Eye size={16} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-mint-dark">
                        <p className="text-xs text-forest/40">
                            Mostrando {filtered.length === 0 ? 0 : Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)} a {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} resultados
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-full text-xs font-medium text-forest/60 border border-mint-dark hover:bg-mint disabled:opacity-40 transition-colors">Anterior</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-full text-xs font-bold transition-colors border ${page === p ? 'bg-lime text-forest border-lime' : 'text-forest/60 border-mint-dark hover:bg-mint'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-full text-xs font-medium text-forest/60 border border-mint-dark hover:bg-mint disabled:opacity-40 transition-colors">Próximo</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
