'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import StatCard from '@/app/components/StatCard';
import { Package, Eye, CheckCircle2, Bell, Share2, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const chartData = [
    { month: 'Jan', views: 320 }, { month: 'Fev', views: 480 }, { month: 'Mar', views: 390 },
    { month: 'Abr', views: 620 }, { month: 'Mai', views: 850 }, { month: 'Jun', views: 740 },
    { month: 'Jul', views: 980 },
];

function MiniChart() {
    const max = Math.max(...chartData.map((d) => d.views));
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * 500;
        const y = 140 - (d.views / max) * 120;
        return `${x},${y}`;
    });
    return (
        <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d0f274" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#d0f274" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon fill="url(#chartGrad)" points={`0,140 ${points.join(' ')} 500,140`} />
            <polyline fill="none" stroke="#d0f274" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
            {chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 500;
                const y = 140 - (d.views / max) * 120;
                return <circle key={i} cx={x} cy={y} r="4" fill="#d0f274" stroke="#0f2926" strokeWidth="2" />;
            })}
        </svg>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0 });
    const [loading, setLoading] = useState(true);
    const [newOrders, setNewOrders] = useState<{ id: string; customer_name: string; total: number; date: string }[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastReadTs, setLastReadTs] = useState('1970-01-01T00:00:00Z');

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('profile_id', user.id);
        const { count: active } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).eq('status', 'em-estoque');
        const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('profile_id', user.id);
        const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).eq('status', 'pendente');
        setStats({ totalProducts: total || 0, activeProducts: active || 0, totalOrders: orders || 0, pendingOrders: pending || 0 });

        // Load recent orders for notifications
        const lastReadTimestamp = localStorage.getItem(`lastReadOrders_${user.id}`) || '1970-01-01T00:00:00Z';
        setLastReadTs(lastReadTimestamp);
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, customer_name, total, date')
            .eq('profile_id', user.id)
            .order('date', { ascending: false })
            .limit(20);

        if (recentOrders) {
            const unread = recentOrders.filter(o => new Date(o.date) > new Date(lastReadTimestamp));
            setNewOrders(recentOrders.slice(0, 10));
            setUnreadCount(unread.length);
        }

        setLoading(false);
    }

    const handleMarkAsRead = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            localStorage.setItem(`lastReadOrders_${user.id}`, new Date().toISOString());
        }
        setUnreadCount(0);
        setLastReadTs(new Date().toISOString());
    };

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-forest">Visão Geral</h1>
                        <p className="text-forest/50 text-sm mt-0.5">Bem-vindo de volta, veja o que está acontecendo.</p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications && unreadCount > 0) handleMarkAsRead(); }}
                            className="relative w-10 h-10 rounded-full border border-mint-dark bg-white text-forest flex items-center justify-center hover:bg-mint transition-colors shadow-soft"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && !loading && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-mint-dark shadow-[0_8px_30px_0_rgba(15,41,38,0.12)] z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-mint-dark flex items-center justify-between">
                                        <h3 className="font-bold text-forest text-sm">Notificações</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAsRead}
                                                className="text-[11px] font-semibold text-forest/50 hover:text-forest transition-colors"
                                            >
                                                Marcar como lido
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {newOrders.length === 0 ? (
                                            <div className="py-8 text-center text-forest/40">
                                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                                <p className="text-sm font-medium">Nenhum pedido recente</p>
                                            </div>
                                        ) : (
                                            newOrders.map((order) => {
                                                const isNew = new Date(order.date) > new Date(lastReadTs);
                                                return (
                                                    <a
                                                        key={order.id}
                                                        href={`/pedidos/${order.id}`}
                                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-mint/50 transition-colors border-b border-mint-dark/50 last:border-0 ${isNew ? 'bg-lime/10' : ''}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isNew ? 'bg-lime/30' : 'bg-mint'}`}>
                                                            <ShoppingBag size={14} className="text-forest" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-forest leading-tight truncate">
                                                                {order.customer_name || 'Cliente'}
                                                            </p>
                                                            <p className="text-xs text-forest/50 mt-0.5">
                                                                Pedido {order.id.substring(0, 12).toUpperCase()} • {formatPrice(order.total)}
                                                            </p>
                                                            <p className="text-[10px] text-forest/30 mt-0.5">{formatDate(order.date)}</p>
                                                        </div>
                                                        {isNew && (
                                                            <div className="w-2 h-2 rounded-full bg-lime flex-shrink-0 mt-2" />
                                                        )}
                                                    </a>
                                                );
                                            })
                                        )}
                                    </div>
                                    {newOrders.length > 0 && (
                                        <a
                                            href="/pedidos"
                                            className="block text-center py-3 text-xs font-bold text-forest/50 hover:text-forest hover:bg-mint/50 transition-colors border-t border-mint-dark"
                                        >
                                            Ver todos os pedidos
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <StatCard icon={<Package size={22} className="text-forest" />} label="Total de Produtos" value={loading ? '...' : stats.totalProducts} trend="12%" trendUp={true} />
                    <StatCard icon={<CheckCircle2 size={22} className="text-forest" />} label="Produtos Ativos" value={loading ? '...' : stats.activeProducts} trend="5%" trendUp={true} />
                    <StatCard icon={<ShoppingBag size={22} className="text-forest" />} label="Total de Pedidos" value={loading ? '...' : stats.totalOrders} trend="8%" trendUp={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-mint-dark">
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                <h2 className="font-bold text-forest text-base">Desempenho do Catálogo</h2>
                                <p className="text-forest/40 text-xs mt-0.5">Visualizações mensais</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-forest/50">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-lime inline-block" />
                                    Este Ano
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 h-40"><MiniChart /></div>
                        <div className="flex justify-between mt-2 px-1">
                            {chartData.map((d) => <span key={d.month} className="text-xs text-forest/40">{d.month}</span>)}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-card border border-mint-dark">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-forest text-base">Como Usar</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: <Package size={14} className="text-lime" />, text: 'Cadastre seus produtos', detail: 'Acesse "Meus Produtos" para criar itens.' },
                                { icon: <Share2 size={14} className="text-lime" />, text: 'Compartilhe seu catálogo', detail: 'Copie o link na tela de Produtos.' },
                                { icon: <Eye size={14} className="text-lime" />, text: 'Acompanhe pedidos', detail: 'Clientes fazem pedidos pelo WhatsApp.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-7 h-7 rounded-xl bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">{item.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-forest leading-tight">{item.text}</p>
                                        <p className="text-xs text-forest/40 mt-0.5 leading-tight">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
