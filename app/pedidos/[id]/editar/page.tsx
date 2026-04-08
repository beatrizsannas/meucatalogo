'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import CustomSelect from '@/app/components/CustomSelect';
import { orders } from '@/app/data/orders';
import { ChevronLeft, Save, User, Phone, Tag } from 'lucide-react';

const statuses = ['pendente', 'confirmado', 'em-preparacao', 'enviado', 'cancelado'];
const statusLabels: Record<string, string> = {
    'pendente': 'Pendente',
    'confirmado': 'Confirmado',
    'em-preparacao': 'Em Preparação',
    'enviado': 'Enviado',
    'cancelado': 'Cancelado'
};

export default function EditarPedidoPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // In a real app we would fetch the order from an API.
    // For MVP, we find it in the mock array. 
    const orderIndex = orders.findIndex(o => o.id === params.id);
    const order = orders[orderIndex];

    if (!order) {
        if (typeof window !== 'undefined') router.push('/pedidos');
        return null;
    }

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API update
        setTimeout(() => {
            // Update the mock data directly so it persists across client navigations
            orders[orderIndex] = {
                ...order,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                status: formData.status as any
            };

            setIsSaving(false);
            router.push('/pedidos');
            router.refresh();
        }, 800);
    };

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="flex min-h-screen bg-mint/50">
            <Sidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-3xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href={`/pedidos/${order.id}`}
                            className="w-10 h-10 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest/60 hover:text-forest hover:bg-mint transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-forest">Editar Pedido {order.id}</h1>
                            <p className="text-forest/50 text-sm mt-0.5">
                                Atualize as informações do cliente ou o status do pedido.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-card border border-mint-dark overflow-hidden">
                        <form onSubmit={handleSave} className="p-6 sm:p-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Customer Name */}
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">
                                        Nome do Cliente *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Customer Phone */}
                                <div>
                                    <label className="block text-sm font-bold text-forest mb-2">
                                        Telefone/WhatsApp *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-forest mb-2">
                                        Status do Pedido *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40 z-10 pointer-events-none">
                                            <Tag size={18} />
                                        </div>
                                        <CustomSelect
                                            value={formData.status}
                                            onChange={(val) => setFormData({ ...formData, status: val as any })}
                                            options={statuses.map((s) => ({ value: s, label: statusLabels[s] }))}
                                            className="w-full flex items-center justify-between pl-11 pr-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer transition-all text-left"
                                        />
                                    </div>
                                    <p className="text-xs text-forest/50 mt-2">
                                        Alterar o status atualizará a listagem geral de pedidos.
                                    </p>
                                </div>
                            </div>

                            {/* Read-only items recap */}
                            <div className="bg-mint/30 rounded-2xl p-6 border border-mint-dark mb-10">
                                <h3 className="text-sm font-bold text-forest mb-4">Resumo dos Itens (Somente Leitura)</h3>
                                <ul className="space-y-3 mb-4">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between text-sm text-forest/80">
                                            <span>{item.quantity}x {item.productName}</span>
                                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center pt-4 border-t border-mint-dark">
                                    <span className="font-bold text-forest">Total</span>
                                    <span className="font-extrabold text-forest text-lg">{formatPrice(order.total)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-mint-dark flex items-center justify-end gap-3">
                                <Link
                                    href={`/pedidos/${order.id}`}
                                    className="px-6 py-3 rounded-full text-sm font-semibold text-forest/60 hover:text-forest hover:bg-mint transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
