'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import {
    ChevronLeft, User, Phone, Mail, MapPin, FileText,
    ShoppingBag, TrendingUp, Calendar, Eye, Pencil, X,
    CheckCircle2, Loader2, StickyNote, Home, Trash2, AlertTriangle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Customer = {
    id: string;
    profile_id: string;
    name: string;
    phone: string;
    cpf?: string;
    email?: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    notes?: string;
    created_at: string;
};

type Order = {
    id: string;
    date: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    status: string;
    items: { productName: string; quantity: number; price: number }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function onlyDigits(v: string) { return (v || '').replace(/\D/g, ''); }

function formatPhone(v: string) {
    const d = onlyDigits(v);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function formatCPF(v: string) {
    const d = onlyDigits(v).slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');
}

function formatCEP(v: string) {
    const d = onlyDigits(v).slice(0, 8);
    return d.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
}

function formatPrice(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(s: string) {
    return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
    'confirmado': { bg: 'bg-lime', text: 'text-forest', label: 'Confirmado' },
    'em-preparacao': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Preparação' },
    'enviado': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enviado' },
    'cancelado': { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelado' },
    'entregue': { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregue' },
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
    customer,
    onClose,
    onSave,
}: {
    customer: Customer;
    onClose: () => void;
    onSave: (data: Partial<Customer>) => Promise<void>;
}) {
    const [form, setForm] = useState({
        name: customer.name || '',
        phone: customer.phone || '',
        cpf: customer.cpf || '',
        email: customer.email || '',
        cep: customer.cep || '',
        street: customer.street || '',
        number: customer.number || '',
        complement: customer.complement || '',
        neighborhood: customer.neighborhood || '',
        city: customer.city || '',
        state: customer.state || '',
        notes: customer.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, phone: onlyDigits(e.target.value).slice(0, 11) }));

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, cpf: onlyDigits(e.target.value).slice(0, 11) }));

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = onlyDigits(e.target.value).slice(0, 8);
        setForm(f => ({ ...f, cep: raw }));
        if (raw.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setForm(f => ({
                        ...f,
                        street: data.logradouro || f.street,
                        neighborhood: data.bairro || f.neighborhood,
                        city: data.localidade || f.city,
                        state: data.uf || f.state,
                    }));
                }
            } catch { /* ignore */ }
            setCepLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || onlyDigits(form.phone).length < 10) return;
        setSaving(true);
        await onSave({
            name: form.name.trim(),
            phone: onlyDigits(form.phone),
            cpf: onlyDigits(form.cpf) || undefined,
            email: form.email.trim() || undefined,
            cep: onlyDigits(form.cep) || undefined,
            street: form.street.trim() || undefined,
            number: form.number.trim() || undefined,
            complement: form.complement.trim() || undefined,
            neighborhood: form.neighborhood.trim() || undefined,
            city: form.city.trim() || undefined,
            state: form.state.trim().toUpperCase() || undefined,
            notes: form.notes.trim() || undefined,
        });
        setSaving(false);
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-mint-dark bg-mint text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:ring-2 focus:ring-lime transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,41,38,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-7 py-5 border-b border-mint-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center">
                            <Pencil size={15} className="text-forest" />
                        </div>
                        <h2 className="font-bold text-forest text-base">Editar Cliente</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-forest hover:bg-mint transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">
                    <div>
                        <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User size={12} /> Identificação</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-forest mb-1">Nome <span className="text-red-400">*</span></label>
                                <input type="text" value={form.name} onChange={set('name')} className={inputCls} placeholder="Nome completo" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">Telefone <span className="text-red-400">*</span></label>
                                <input type="tel" value={form.phone ? formatPhone(form.phone) : ''} onChange={handlePhoneChange} className={inputCls} placeholder="(11) 99999-9999" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">CPF</label>
                                <input type="text" value={form.cpf ? formatCPF(form.cpf) : ''} onChange={handleCPFChange} className={inputCls} placeholder="000.000.000-00" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-forest mb-1">E-mail</label>
                                <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="cliente@email.com" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Home size={12} /> Endereço</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-forest mb-1">CEP</label>
                                <input type="text" value={form.cep ? formatCEP(form.cep) : ''} onChange={handleCEPChange} className={inputCls + ' pr-8'} placeholder="00000-000" />
                                {cepLoading && <Loader2 size={13} className="absolute right-3 bottom-3 text-forest/40 animate-spin" />}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-forest mb-1">Rua</label>
                                <input type="text" value={form.street} onChange={set('street')} className={inputCls} placeholder="Nome da rua" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">Número</label>
                                <input type="text" value={form.number} onChange={set('number')} className={inputCls} placeholder="Nº" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">Complemento</label>
                                <input type="text" value={form.complement} onChange={set('complement')} className={inputCls} placeholder="Apto, bloco..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">Bairro</label>
                                <input type="text" value={form.neighborhood} onChange={set('neighborhood')} className={inputCls} placeholder="Bairro" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-forest mb-1">Cidade</label>
                                <input type="text" value={form.city} onChange={set('city')} className={inputCls} placeholder="Cidade" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-forest mb-1">Estado</label>
                                <input type="text" value={form.state} onChange={set('state')} className={inputCls} placeholder="SP" maxLength={2} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><StickyNote size={12} /> Observações</p>
                        <textarea value={form.notes} onChange={set('notes')} rows={3} className={inputCls + ' resize-none'} placeholder="Anotações sobre o cliente..." />
                    </div>
                </div>

                <div className="flex gap-3 px-7 py-5 border-t border-mint-dark flex-shrink-0">
                    <button onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 rounded-full bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                        {saving ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={15} /> Salvar Alterações</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClienteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => { if (id) loadData(); }, [id]);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    async function loadData() {
        setLoading(true);
        const supabase = createClient();

        const { data: cust } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (!cust) { setLoading(false); return; }
        setCustomer(cust);

        // Load orders matched by phone (digits only match)
        const phone = onlyDigits(cust.phone);
        const { data: allOrders } = await supabase
            .from('orders')
            .select('id, date, customer_name, customer_phone, total, status, items')
            .eq('profile_id', cust.profile_id)
            .order('date', { ascending: false });

        const matched = (allOrders || []).filter(o =>
            onlyDigits(o.customer_phone || '') === phone
        );
        setOrders(matched);
        setLoading(false);
    }

    const handleEdit = async (data: Partial<Customer>) => {
        const supabase = createClient();
        const { error } = await supabase.from('customers').update(data).eq('id', id);
        if (!error) {
            setCustomer(c => c ? { ...c, ...data } : c);
            setShowEdit(false);
            showToast('Cliente atualizado!');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const supabase = createClient();
        await supabase.from('customers').delete().eq('id', id);
        router.push('/clientes');
    };

    if (loading) return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-forest/30" />
            </main>
        </div>
    );

    if (!customer) return (
        <div className="flex min-h-screen bg-mint">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center justify-center gap-3">
                <User size={40} className="text-forest/20" />
                <p className="text-forest/50 font-medium">Cliente não encontrado.</p>
                <Link href="/clientes" className="text-sm text-forest underline">Voltar para clientes</Link>
            </main>
        </div>
    );

    // Stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    const lastOrder = orders[0];
    const pdvOrders = orders.filter(o => o.customer_phone === 'PDV' || onlyDigits(o.customer_phone) === onlyDigits(customer.phone)).length;

    const fullAddress = [
        customer.street && `${customer.street}${customer.number ? ', ' + customer.number : ''}`,
        customer.complement,
        customer.neighborhood,
        customer.city && `${customer.city}${customer.state ? ' - ' + customer.state : ''}`,
        customer.cep && `CEP: ${formatCEP(customer.cep)}`,
    ].filter(Boolean).join('\n');

    return (
        <div className="flex min-h-screen bg-mint relative">
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-5 py-2.5 rounded-full font-medium text-sm shadow-xl flex items-center gap-2 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-lime flex items-center justify-center text-forest text-[10px] font-black">✓</div>
                    {toast}
                </div>
            )}

            <Sidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/clientes" className="w-10 h-10 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest/60 hover:text-forest hover:bg-mint transition-colors shadow-sm">
                                <ChevronLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-forest">{customer.name}</h1>
                                <p className="text-forest/50 text-sm mt-0.5">
                                    Cadastrado em {formatDate(customer.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowEdit(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-mint-dark text-forest text-sm font-semibold hover:bg-mint transition-colors shadow-sm"
                            >
                                <Pencil size={14} /> Editar
                            </button>
                            <button
                                onClick={() => setShowDelete(true)}
                                className="w-10 h-10 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT: Customer info */}
                        <div className="space-y-5">
                            {/* Avatar + basic info */}
                            <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                <div className="flex flex-col items-center text-center mb-5">
                                    <div className="w-20 h-20 rounded-full bg-lime/30 flex items-center justify-center mb-3">
                                        <span className="text-3xl font-black text-forest">{customer.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <h2 className="font-bold text-forest text-lg leading-tight">{customer.name}</h2>
                                    {customer.cpf && (
                                        <p className="text-xs text-forest/40 font-mono mt-1">CPF: {formatCPF(customer.cpf)}</p>
                                    )}
                                </div>

                                <div className="space-y-3 divide-y divide-mint-dark">
                                    {/* Phone */}
                                    <div className="flex items-center gap-3 pt-3 first:pt-0">
                                        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center flex-shrink-0">
                                            <Phone size={14} className="text-forest/60" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-forest/40">Telefone</p>
                                            <p className="text-sm font-semibold text-forest">{formatPhone(customer.phone)}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    {customer.email && (
                                        <div className="flex items-center gap-3 pt-3">
                                            <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center flex-shrink-0">
                                                <Mail size={14} className="text-forest/60" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-forest/40">E-mail</p>
                                                <p className="text-sm font-semibold text-forest truncate">{customer.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* WhatsApp button */}
                                <a
                                    href={`https://wa.me/55${onlyDigits(customer.phone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-mint text-forest text-sm font-bold hover:bg-mint-dark transition-colors"
                                >
                                    <Phone size={14} /> Abrir WhatsApp
                                </a>
                            </div>

                            {/* Address */}
                            {fullAddress && (
                                <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center">
                                            <MapPin size={14} className="text-forest/60" />
                                        </div>
                                        <h3 className="text-sm font-bold text-forest/60 uppercase tracking-wider">Endereço</h3>
                                    </div>
                                    <p className="text-sm text-forest leading-relaxed whitespace-pre-line">{fullAddress}</p>
                                </div>
                            )}

                            {/* Notes */}
                            {customer.notes && (
                                <div className="bg-white rounded-3xl shadow-card border border-mint-dark p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center">
                                            <StickyNote size={14} className="text-forest/60" />
                                        </div>
                                        <h3 className="text-sm font-bold text-forest/60 uppercase tracking-wider">Observações</h3>
                                    </div>
                                    <p className="text-sm text-forest/70 leading-relaxed">{customer.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Stats + Orders */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    {
                                        icon: <ShoppingBag size={18} className="text-forest" />,
                                        label: 'Total de Pedidos',
                                        value: totalOrders,
                                        sub: '',
                                    },
                                    {
                                        icon: <TrendingUp size={18} className="text-forest" />,
                                        label: 'Total Gasto',
                                        value: formatPrice(totalSpent),
                                        sub: '',
                                    },
                                    {
                                        icon: <Calendar size={18} className="text-forest" />,
                                        label: 'Último Pedido',
                                        value: lastOrder ? formatDate(lastOrder.date) : '—',
                                        sub: '',
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-2xl shadow-card border border-mint-dark p-5">
                                        <div className="w-9 h-9 rounded-xl bg-lime/20 flex items-center justify-center mb-3">
                                            {stat.icon}
                                        </div>
                                        <p className="text-lg font-black text-forest leading-tight">{stat.value}</p>
                                        <p className="text-xs text-forest/40 mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Orders table */}
                            <div className="bg-white rounded-3xl shadow-card border border-mint-dark overflow-hidden">
                                <div className="px-6 py-4 border-b border-mint-dark flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={16} className="text-forest/60" />
                                        <h3 className="font-bold text-forest text-sm">Histórico de Pedidos</h3>
                                    </div>
                                    <span className="text-xs text-forest/40">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center justify-center text-center">
                                        <ShoppingBag size={32} className="text-forest/15 mb-3" />
                                        <p className="text-forest/40 text-sm font-medium">Nenhum pedido encontrado</p>
                                        <p className="text-forest/25 text-xs mt-1">Os pedidos deste cliente aparecerão aqui</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-mint-dark bg-mint/20">
                                                <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-3">Pedido</th>
                                                <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3">Data</th>
                                                <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Itens</th>
                                                <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3">Total</th>
                                                <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3">Status</th>
                                                <th className="px-4 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-mint-dark">
                                            {orders.map(order => {
                                                const items = Array.isArray(order.items) ? order.items : [];
                                                const st = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
                                                const isPDV = order.customer_phone === 'PDV';
                                                return (
                                                    <tr key={order.id} className="hover:bg-mint/40 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-forest text-xs font-mono">#{order.id.substring(0, 8).toUpperCase()}</p>
                                                            {isPDV && (
                                                                <span className="text-[10px] font-bold text-forest/60 bg-lime/30 px-1.5 py-0.5 rounded-full">PDV</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="text-forest/70 text-sm whitespace-nowrap">{formatDate(order.date)}</p>
                                                        </td>
                                                        <td className="px-4 py-4 hidden md:table-cell">
                                                            <p className="text-forest/50 text-xs max-w-[180px] truncate">
                                                                {items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ') || '—'}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="font-bold text-forest text-sm">{formatPrice(order.total)}</p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                                                                {st.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Link
                                                                href={`/pedidos/${order.id}`}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-forest/30 hover:bg-mint hover:text-forest transition-colors"
                                                                title="Ver pedido"
                                                            >
                                                                <Eye size={15} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showEdit && customer && (
                <EditModal
                    customer={customer}
                    onClose={() => setShowEdit(false)}
                    onSave={handleEdit}
                />
            )}

            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,41,38,0.55)', backdropFilter: 'blur(6px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-forest mb-2">Excluir cliente?</h2>
                        <p className="text-forest/60 text-sm mb-1">Você está prestes a excluir</p>
                        <p className="font-bold text-forest mb-2">&ldquo;{customer.name}&rdquo;</p>
                        <p className="text-xs text-forest/40 mb-8">Os pedidos não serão excluídos, apenas o cadastro.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDelete(false)} disabled={deleting} className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                {deleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
