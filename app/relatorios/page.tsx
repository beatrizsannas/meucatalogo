'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/app/components/Sidebar';
import CustomSelect from '@/app/components/CustomSelect';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Filter, Printer, ShoppingBag, DollarSign, Package, PieChart, BarChart3, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';

type OrderItem = { price: number; quantity: number; productName: string };
type Order = {
    id: string;
    total: number;
    status: string;
    date: string;
    items: OrderItem[];
};

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Este Mês');
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data } = await supabase
            .from('orders')
            .select('id, total, status, date, items')
            .eq('profile_id', user.id);

        if (data) {
            setOrders(data as Order[]);
        }
        setLoading(false);
    }

    // --- FILTERS ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        return orders.filter(o => {
            const date = new Date(o.date);
            let dateMatch = true;

            if (period === 'Este Mês') {
                dateMatch = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            } else if (period === 'Últimos 30 Dias') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                dateMatch = date >= thirtyDaysAgo;
            } else if (period === 'Este Ano') {
                dateMatch = date.getFullYear() === now.getFullYear();
            }

            return dateMatch;
        });
    }, [orders, period]);

    // --- KPIs ---
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = filteredOrders.length;
    const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
    
    // safe item counting
    const totalItems = filteredOrders.reduce((sum, o) => {
        const itemsCount = Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
        return sum + itemsCount;
    }, 0);

    // --- TOP PRODUCTS ---
    const topProducts = useMemo(() => {
        const counts: Record<string, { qty: number, revenue: number }> = {};
        filteredOrders.forEach(o => {
            if (Array.isArray(o.items)) {
                o.items.forEach(i => {
                    if (!counts[i.productName]) counts[i.productName] = { qty: 0, revenue: 0 };
                    counts[i.productName].qty += (i.quantity || 1);
                    counts[i.productName].revenue += (i.quantity || 1) * (i.price || 0);
                });
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5);
    }, [filteredOrders]);

    // --- STATUS DISTRIBUTION ---
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredOrders.forEach(o => {
            const st = o.status || 'pendente';
            counts[st] = (counts[st] || 0) + 1;
        });
        return counts;
    }, [filteredOrders]);

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Status colors
    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            'finalizado': '#10B981', // emerald-500
            'entregue': '#34D399', // emerald-400
            'pronto': '#8B5CF6', // violet-500
            'preparando': '#F59E0B', // amber-500
            'confirmado': '#3B82F6', // blue-500
            'pendente': '#94A3B8', // slate-400
            'cancelado': '#EF4444', // red-500
        };
        return map[status.toLowerCase()] || '#94A3B8';
    };

    const handlePrint = () => {
        window.print();
    };

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

    return (
        <div className="flex min-h-screen bg-mint relative print:bg-mint" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* Sidebar is hidden when printing */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            <main className="flex-1 p-8 overflow-auto print:p-0 print:overflow-visible">
                {/* Header (Hidden on print) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 print:hidden gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-forest flex items-center gap-2">
                            <TrendingUp size={24} />
                            Relatórios Financeiros
                        </h1>
                        <p className="text-forest/50 text-sm mt-0.5">Analise o desempenho das suas vendas</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filters */}
                        <div className="min-w-[160px]">
                            <CustomSelect 
                                value={period}
                                onChange={setPeriod}
                                options={[
                                    { value: 'Este Mês', label: 'Este Mês' },
                                    { value: 'Últimos 30 Dias', label: 'Últimos 30 Dias' },
                                    { value: 'Este Ano', label: 'Este Ano' },
                                    { value: 'Todo o Período', label: 'Todo o Período' }
                                ]}
                            />
                        </div>

                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-forest text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-forest/90 transition-colors shadow-sm"
                        >
                            <Printer size={18} />
                            Salvar PDF / Imprimir
                        </button>
                    </div>
                </div>

                {/* Print Header (Only visible on print) */}
                <div className="hidden print:block mb-8 text-center border-b border-forest/10 pb-6">
                    <h1 className="text-3xl font-extrabold text-forest mb-2">Relatório de Vendas</h1>
                    <p className="text-forest/60">Período: {period}</p>
                    <p className="text-forest/40 text-xs mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 print:grid-cols-4 print:gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center text-forest">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-semibold text-forest/70 text-sm">Receita Total</h3>
                        </div>
                        <p className="text-2xl font-bold text-forest">{formatPrice(totalRevenue)}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center text-forest">
                                <ReceiptText size={20} />
                            </div>
                            <h3 className="font-semibold text-forest/70 text-sm">Ticket Médio</h3>
                        </div>
                        <p className="text-2xl font-bold text-forest">{formatPrice(averageTicket)}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center text-forest">
                                <ShoppingBag size={20} />
                            </div>
                            <h3 className="font-semibold text-forest/70 text-sm">Qtd. Pedidos</h3>
                        </div>
                        <p className="text-2xl font-bold text-forest">{orderCount}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center text-forest">
                                <Package size={20} />
                            </div>
                            <h3 className="font-semibold text-forest/70 text-sm">Itens Vendidos</h3>
                        </div>
                        <p className="text-2xl font-bold text-forest">{totalItems}</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4 print:break-inside-avoid">
                    
                    {/* Status Distribution */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark lg:col-span-1 print:col-span-1 flex flex-col">
                        <h2 className="font-bold text-forest text-base flex items-center gap-2 mb-6">
                            <PieChart size={18} className="text-lime" />
                            Pedidos por Status
                        </h2>
                        
                        {orderCount === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-forest/40 text-sm">Nenhum dado</div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="space-y-4 flex-1 justify-center flex flex-col">
                                    {Object.entries(statusCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([status, count]) => {
                                        const pct = Math.round((count / orderCount) * 100);
                                        return (
                                            <div key={status} className="print:break-inside-avoid">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-semibold text-forest capitalize">{status}</span>
                                                    <span className="text-forest/60">{count} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-mint rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${pct}%`, backgroundColor: getStatusColor(status) }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-mint-dark lg:col-span-2 print:col-span-2 flex flex-col">
                        <h2 className="font-bold text-forest text-base flex items-center gap-2 mb-6">
                            <BarChart3 size={18} className="text-lime" />
                            Produtos Mais Vendidos
                        </h2>

                        {topProducts.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-forest/40 text-sm">Nenhum dado</div>
                        ) : (
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-forest/50 uppercase border-b border-mint-dark/50">
                                        <tr>
                                            <th className="py-3 px-2 font-semibold">Produto</th>
                                            <th className="py-3 px-2 font-semibold text-center">Unidades</th>
                                            <th className="py-3 px-2 font-semibold text-right">Receita Gerada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map(([name, data], idx) => (
                                            <tr key={name} className="border-b border-mint-dark/30 last:border-0 hover:bg-mint/30 transition-colors print:break-inside-avoid">
                                                <td className="py-3 px-2 text-forest font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-forest/5 text-forest/50 flex items-center justify-center text-[10px] font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="line-clamp-1">{name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-forest/80 text-center font-medium">
                                                    {data.qty}
                                                </td>
                                                <td className="py-3 px-2 text-forest text-right font-semibold">
                                                    {formatPrice(data.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Visual Disclaimer for Print */}
                <div className="hidden print:block text-center text-[10px] text-gray-500 pt-8 border-t border-gray-200 mt-12">
                    Relatório gerado automaticamente por Minha Vitrine Gerenciador. Confidencial.
                </div>
            </main>
        </div>
    );
}
