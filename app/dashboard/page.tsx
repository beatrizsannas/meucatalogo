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

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('profile_id', user.id);
        const { count: active } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).eq('status', 'ativo');
        const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('profile_id', user.id);
        const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).eq('status', 'pendente');
        setStats({ totalProducts: total || 0, activeProducts: active || 0, totalOrders: orders || 0, pendingOrders: pending || 0 });
        setLoading(false);
    }

    return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-forest">Visão Geral</h1>
                        <p className="text-forest/50 text-sm mt-0.5">Bem-vindo de volta, veja o que está acontecendo.</p>
                    </div>
                    <button className="relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-mint-dark bg-white text-forest text-sm font-medium hover:bg-mint transition-colors shadow-soft">
                        <div className="relative">
                            <Bell size={15} />
                            {stats.pendingOrders > 0 && !loading && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
                            )}
                        </div>
                        Últimos 30 dias
                    </button>
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
