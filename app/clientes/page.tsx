'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import {
    Users, Plus, Search, Phone, ShoppingBag,
    X, ChevronRight, User, Mail, Home, StickyNote,
    Loader2, CheckCircle2, Eye, Calendar, TrendingUp,
    Pencil, Trash2, AlertTriangle, MapPin,
} from 'lucide-react';
import Link from 'next/link';

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
    order_count?: number;
    total_spent?: number;
};

type CatalogCustomer = {
    phone: string;
    name: string;
    order_count: number;
    total_spent: number;
    source: 'catalog';
};

type CatalogOrder = {
    id: string;
    date: string;
    total: number;
    status: string;
    customer_phone: string;
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

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
    'confirmado': { bg: 'bg-lime', text: 'text-forest', label: 'Confirmado' },
    'em-preparacao': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Preparação' },
    'enviado': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enviado' },
    'cancelado': { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelado' },
    'entregue': { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregue' },
};

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = {
    name: '', phone: '', cpf: '', email: '',
    cep: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', notes: '',
};

// ─── Shared form field ────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-mint-dark bg-mint text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:ring-2 focus:ring-lime transition-all";

// ─── Form fields component ────────────────────────────────────────────────────
function FormFields({
    form,
    setForm,
    errors,
    setErrors,
    cepLoading,
    setCepLoading,
    readOnly = false,
}: {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
    errors: Partial<typeof emptyForm>;
    setErrors: React.Dispatch<React.SetStateAction<Partial<typeof emptyForm>>>;
    cepLoading: boolean;
    setCepLoading: (v: boolean) => void;
    readOnly?: boolean;
}) {
    const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (readOnly) return;
        setForm(f => ({ ...f, [k]: e.target.value }));
        setErrors(er => ({ ...er, [k]: '' }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const raw = onlyDigits(e.target.value).slice(0, 11);
        setForm(f => ({ ...f, phone: raw }));
        setErrors(er => ({ ...er, phone: '' }));
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        setForm(f => ({ ...f, cpf: onlyDigits(e.target.value).slice(0, 11) }));
    };

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
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

    const fieldCls = readOnly
        ? "w-full px-4 py-2.5 rounded-xl border border-mint-dark bg-white text-sm text-forest cursor-default select-all"
        : inputCls;

    return (
        <div className="space-y-5">
            {/* Identity */}
            <div>
                <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={12} /> Identificação
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-forest mb-1">
                            Nome {!readOnly && <span className="text-red-400">*</span>}
                        </label>
                        <input type="text" value={form.name} onChange={set('name')} readOnly={readOnly}
                            placeholder="Nome completo"
                            className={`${fieldCls} ${errors.name ? 'border-red-300 bg-red-50' : ''}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">
                            Telefone {!readOnly && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative">
                            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/30" />
                            <input type="tel" value={form.phone ? formatPhone(form.phone) : ''} onChange={handlePhoneChange} readOnly={readOnly}
                                placeholder="(11) 99999-9999"
                                className={`${fieldCls} pl-8 ${errors.phone ? 'border-red-300 bg-red-50' : ''}`} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">CPF</label>
                        <input type="text" value={form.cpf ? formatCPF(form.cpf) : ''} onChange={handleCPFChange} readOnly={readOnly}
                            placeholder="000.000.000-00" className={fieldCls} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-forest mb-1">E-mail</label>
                        <div className="relative">
                            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/30" />
                            <input type="email" value={form.email} onChange={set('email')} readOnly={readOnly}
                                placeholder="cliente@email.com" className={`${fieldCls} pl-8`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div>
                <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Home size={12} /> Endereço
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-forest mb-1">CEP</label>
                        <input type="text" value={form.cep ? formatCEP(form.cep) : ''} onChange={handleCEPChange} readOnly={readOnly}
                            placeholder="00000-000" className={`${fieldCls} pr-8`} />
                        {cepLoading && <Loader2 size={13} className="absolute right-3 bottom-3 text-forest/40 animate-spin" />}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-forest mb-1">Rua</label>
                        <input type="text" value={form.street} onChange={set('street')} readOnly={readOnly}
                            placeholder="Nome da rua" className={fieldCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">Número</label>
                        <input type="text" value={form.number} onChange={set('number')} readOnly={readOnly}
                            placeholder="Nº" className={fieldCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">Complemento</label>
                        <input type="text" value={form.complement} onChange={set('complement')} readOnly={readOnly}
                            placeholder="Apto, bloco..." className={fieldCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">Bairro</label>
                        <input type="text" value={form.neighborhood} onChange={set('neighborhood')} readOnly={readOnly}
                            placeholder="Bairro" className={fieldCls} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-forest mb-1">Cidade</label>
                        <input type="text" value={form.city} onChange={set('city')} readOnly={readOnly}
                            placeholder="Cidade" className={fieldCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-forest mb-1">Estado</label>
                        <input type="text" value={form.state} onChange={set('state')} readOnly={readOnly}
                            placeholder="SP" maxLength={2} className={`${fieldCls} uppercase`} />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <StickyNote size={12} /> Observações
                </p>
                <textarea value={form.notes} onChange={set('notes')} readOnly={readOnly} rows={3}
                    placeholder="Anotações sobre o cliente..."
                    className={`${fieldCls} resize-none`} />
            </div>
        </div>
    );
}

// ─── New Customer Modal ───────────────────────────────────────────────────────
function NewCustomerModal({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (data: typeof emptyForm) => Promise<string | null>;
}) {
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
    const [saveError, setSaveError] = useState('');

    const validate = () => {
        const errs: Partial<typeof emptyForm> = {};
        if (!form.name.trim()) errs.name = 'Nome é obrigatório';
        if (onlyDigits(form.phone).length < 10) errs.phone = 'Telefone inválido (mínimo 10 dígitos)';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        setSaveError('');
        const err = await onSave(form);
        setSaving(false);
        if (err) setSaveError(err);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,41,38,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-7 py-5 border-b border-mint-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center">
                            <User size={17} className="text-forest" />
                        </div>
                        <div>
                            <h2 className="font-bold text-forest text-base">Novo Cliente</h2>
                            <p className="text-forest/40 text-xs">Nome e telefone são obrigatórios</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-forest hover:bg-mint transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-7 py-5">
                    <FormFields
                        form={form} setForm={setForm}
                        errors={errors} setErrors={setErrors}
                        cepLoading={cepLoading} setCepLoading={setCepLoading}
                    />
                    {saveError && (
                        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            <AlertTriangle size={15} />
                            <span>{saveError}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 px-7 py-5 border-t border-mint-dark flex-shrink-0">
                    <button onClick={onClose} disabled={saving}
                        className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 py-3 rounded-full bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                        {saving
                            ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                            : <><CheckCircle2 size={15} /> Salvar Cliente</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Registered Customer Drawer ───────────────────────────────────────────────
function RegisteredDrawer({
    customer,
    orders,
    onClose,
    onUpdated,
    onDeleted,
}: {
    customer: Customer;
    orders: CatalogOrder[];
    onClose: () => void;
    onUpdated: (updated: Customer) => void;
    onDeleted: (id: string) => void;
}) {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<typeof emptyForm>({
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
    const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
    const [cepLoading, setCepLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saveError, setSaveError] = useState('');

    const totalSpent = orders.reduce((s, o) => s + o.total, 0);
    const lastOrder = orders[0];

    const handleSaveEdit = async () => {
        const errs: Partial<typeof emptyForm> = {};
        if (!form.name.trim()) errs.name = 'Nome é obrigatório';
        if (onlyDigits(form.phone).length < 10) errs.phone = 'Telefone inválido';
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        setSaveError('');
        const supabase = createClient();
        const { error } = await supabase.from('customers').update({
            name: form.name.trim(),
            phone: onlyDigits(form.phone),
            cpf: onlyDigits(form.cpf) || null,
            email: form.email.trim() || null,
            cep: onlyDigits(form.cep) || null,
            street: form.street.trim() || null,
            number: form.number.trim() || null,
            complement: form.complement.trim() || null,
            neighborhood: form.neighborhood.trim() || null,
            city: form.city.trim() || null,
            state: form.state.trim().toUpperCase() || null,
            notes: form.notes.trim() || null,
        }).eq('id', customer.id);
        setSaving(false);

        if (error) {
            setSaveError('Erro ao salvar: ' + error.message);
        } else {
            setEditMode(false);
            onUpdated({ ...customer, ...form, phone: onlyDigits(form.phone) });
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const supabase = createClient();
        await supabase.from('customers').delete().eq('id', customer.id);
        setDeleting(false);
        onDeleted(customer.id);
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-forest/30 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-mint-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-black text-forest">{customer.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-forest text-sm leading-tight">{customer.name}</h2>
                            <p className="text-forest/40 text-xs">{editMode ? 'Modo de edição' : 'Cadastro do cliente'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {!editMode && (
                            <>
                                <button onClick={() => setEditMode(true)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-forest hover:bg-mint transition-colors" title="Editar">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setShowDeleteConfirm(true)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-red-500 hover:bg-red-50 transition-colors" title="Excluir">
                                    <Trash2 size={15} />
                                </button>
                            </>
                        )}
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-forest hover:bg-mint transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2 px-6 py-3 border-b border-mint-dark bg-mint/30 flex-shrink-0">
                    {[
                        { icon: <ShoppingBag size={13} className="text-forest" />, label: 'Pedidos', value: String(orders.length) },
                        { icon: <TrendingUp size={13} className="text-forest" />, label: 'Total gasto', value: formatPrice(totalSpent) },
                        { icon: <Calendar size={13} className="text-forest" />, label: 'Último', value: lastOrder ? new Date(lastOrder.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl p-2.5 text-center">
                            <div className="flex justify-center mb-0.5">{s.icon}</div>
                            <p className="font-bold text-forest text-xs leading-tight">{s.value}</p>
                            <p className="text-forest/40 text-[9px] mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Body: tabs */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        {/* Form */}
                        <FormFields
                            form={form} setForm={setForm}
                            errors={errors} setErrors={setErrors}
                            cepLoading={cepLoading} setCepLoading={setCepLoading}
                            readOnly={!editMode}
                        />
                        {saveError && (
                            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl">
                                <AlertTriangle size={13} />
                                <span>{saveError}</span>
                            </div>
                        )}
                    </div>

                    {/* Orders section */}
                    {orders.length > 0 && (
                        <div className="px-6 pb-6">
                            <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3">Histórico de Pedidos</p>
                            <div className="space-y-2">
                                {orders.map(order => {
                                    const st = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
                                    const items = Array.isArray(order.items) ? order.items : [];
                                    return (
                                        <div key={order.id} className="bg-mint rounded-2xl p-3.5">
                                            <div className="flex items-start justify-between mb-1.5">
                                                <div>
                                                    <p className="font-bold text-forest text-xs font-mono">#{order.id.substring(0, 8).toUpperCase()}</p>
                                                    <p className="text-forest/40 text-[11px]">
                                                        {new Date(order.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                                                    <Link href={`/pedidos/${order.id}`}
                                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-forest/40 hover:text-forest transition-colors">
                                                        <Eye size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-forest/50 truncate">
                                                {items.slice(0, 2).map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                                                {items.length > 2 ? ` +${items.length - 2}` : ''}
                                            </p>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-mint-dark">
                                                <span className="text-[11px] text-forest/40">Total</span>
                                                <span className="font-bold text-forest text-xs">{formatPrice(order.total)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit footer */}
                {editMode && (
                    <div className="flex gap-3 px-6 py-4 border-t border-mint-dark flex-shrink-0">
                        <button onClick={() => { setEditMode(false); setSaveError(''); }}
                            disabled={saving}
                            className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button onClick={handleSaveEdit} disabled={saving}
                            className="flex-1 py-3 rounded-full bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={14} /> Salvar</>}
                        </button>
                    </div>
                )}
            </div>

            {/* Delete confirm */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,41,38,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={26} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-forest mb-1">Excluir cliente?</h3>
                        <p className="text-forest/50 text-sm mb-1">Você vai excluir</p>
                        <p className="font-bold text-forest mb-2">&ldquo;{customer.name}&rdquo;</p>
                        <p className="text-xs text-forest/30 mb-6">Os pedidos não serão excluídos.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                                className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={deleting}
                                className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                {deleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Catalog Customer Drawer ──────────────────────────────────────────────────
function CatalogDrawer({
    customer,
    onClose,
}: {
    customer: CatalogCustomer & { orders: CatalogOrder[] };
    onClose: () => void;
}) {
    const totalSpent = customer.orders.reduce((s, o) => s + o.total, 0);
    const lastOrder = customer.orders[0];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-forest/30 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
                <div className="flex items-center justify-between px-6 py-5 border-b border-mint-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-black text-amber-700">{customer.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-forest text-base leading-tight">{customer.name}</h2>
                            <p className="text-forest/50 text-xs mt-0.5 flex items-center gap-1">
                                <Phone size={10} /> {formatPhone(customer.phone)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-forest/40 hover:text-forest hover:bg-mint transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-mint-dark flex-shrink-0">
                    {[
                        { icon: <ShoppingBag size={14} className="text-forest" />, label: 'Pedidos', value: String(customer.order_count) },
                        { icon: <TrendingUp size={14} className="text-forest" />, label: 'Total gasto', value: formatPrice(totalSpent) },
                        { icon: <Calendar size={14} className="text-forest" />, label: 'Último pedido', value: lastOrder ? new Date(lastOrder.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—' },
                    ].map((s, i) => (
                        <div key={i} className="bg-mint rounded-xl p-3 text-center">
                            <div className="flex justify-center mb-1">{s.icon}</div>
                            <p className="font-bold text-forest text-sm leading-tight">{s.value}</p>
                            <p className="text-forest/40 text-[10px] mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <p className="text-xs font-bold text-forest/40 uppercase tracking-wider mb-3">Histórico de Pedidos</p>
                    <div className="space-y-3">
                        {customer.orders.map(order => {
                            const st = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: order.status };
                            const items = Array.isArray(order.items) ? order.items : [];
                            return (
                                <div key={order.id} className="bg-mint rounded-2xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-bold text-forest text-xs font-mono">#{order.id.substring(0, 8).toUpperCase()}</p>
                                            <p className="text-forest/40 text-xs mt-0.5">
                                                {new Date(order.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                                            <Link href={`/pedidos/${order.id}`}
                                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-forest/40 hover:text-forest transition-colors">
                                                <Eye size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 mb-3">
                                        {items.slice(0, 3).map((item, i) => (
                                            <p key={i} className="text-xs text-forest/60 truncate">{item.quantity}x {item.productName}</p>
                                        ))}
                                        {items.length > 3 && <p className="text-xs text-forest/30">+ {items.length - 3} itens</p>}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-mint-dark">
                                        <span className="text-xs text-forest/40">Total</span>
                                        <span className="font-bold text-forest text-sm">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientesPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [catalogOnly, setCatalogOnly] = useState<CatalogCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);
    const [toast, setToast] = useState('');
    const [profileId, setProfileId] = useState<string | null>(null);

    // Registered customer drawer
    const [selectedRegistered, setSelectedRegistered] = useState<Customer | null>(null);
    const [registeredOrders, setRegisteredOrders] = useState<CatalogOrder[]>([]);
    const [loadingRegisteredOrders, setLoadingRegisteredOrders] = useState(false);

    // Catalog customer drawer
    const [selectedCatalog, setSelectedCatalog] = useState<(CatalogCustomer & { orders: CatalogOrder[] }) | null>(null);
    const [loadingCatalogOrders, setLoadingCatalogOrders] = useState(false);

    // DB warning
    const [dbError, setDbError] = useState(false);

    useEffect(() => { loadData(); }, []);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    async function loadData() {
        setLoading(true);
        setDbError(false);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setProfileId(user.id);

        const { data: custs, error: custError } = await supabase
            .from('customers')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (custError) {
            // Table probably doesn't exist yet
            setDbError(true);
            setLoading(false);
        }

        const { data: orders } = await supabase
            .from('orders')
            .select('customer_name, customer_phone, total, date')
            .eq('profile_id', user.id);

        const allOrders = orders || [];
        const phoneStats: Record<string, { count: number; total: number; name: string }> = {};
        for (const o of allOrders) {
            const ph = onlyDigits(o.customer_phone || '');
            if (!ph || ph === 'PDV') continue;
            if (!phoneStats[ph]) phoneStats[ph] = { count: 0, total: 0, name: o.customer_name || '' };
            phoneStats[ph].count++;
            phoneStats[ph].total += o.total || 0;
        }

        const registeredPhones = new Set<string>();
        const enriched = (custs || []).map(c => {
            const ph = onlyDigits(c.phone);
            registeredPhones.add(ph);
            const stats = phoneStats[ph];
            return { ...c, order_count: stats?.count || 0, total_spent: stats?.total || 0 };
        });

        const catalogCustomers: CatalogCustomer[] = Object.entries(phoneStats)
            .filter(([ph]) => !registeredPhones.has(ph))
            .map(([phone, stats]) => ({
                phone, name: stats.name || 'Cliente do Catálogo',
                order_count: stats.count, total_spent: stats.total, source: 'catalog' as const,
            }))
            .sort((a, b) => b.order_count - a.order_count);

        setCustomers(enriched);
        setCatalogOnly(catalogCustomers);
        setLoading(false);
    }

    async function openRegisteredCustomer(c: Customer) {
        setSelectedRegistered(c);
        setLoadingRegisteredOrders(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoadingRegisteredOrders(false); return; }
        const { data } = await supabase
            .from('orders')
            .select('id, date, total, status, items, customer_phone')
            .eq('profile_id', user.id)
            .order('date', { ascending: false });
        const matched = (data || []).filter(o => onlyDigits(o.customer_phone || '') === onlyDigits(c.phone));
        setRegisteredOrders(matched);
        setLoadingRegisteredOrders(false);
    }

    async function openCatalogCustomer(c: CatalogCustomer) {
        setLoadingCatalogOrders(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('orders')
            .select('id, date, total, status, items, customer_phone')
            .eq('profile_id', user.id)
            .order('date', { ascending: false });
        const matched = (data || []).filter(o => onlyDigits(o.customer_phone || '') === onlyDigits(c.phone));
        setSelectedCatalog({ ...c, orders: matched });
        setLoadingCatalogOrders(false);
    }

    // Save new customer — returns error string or null on success
    const handleSaveNew = async (form: typeof emptyForm): Promise<string | null> => {
        if (!profileId) return 'Sessão expirada. Recarregue a página.';
        const supabase = createClient();
        const { error } = await supabase.from('customers').insert({
            profile_id: profileId,
            name: form.name.trim(),
            phone: onlyDigits(form.phone),
            cpf: onlyDigits(form.cpf) || null,
            email: form.email.trim() || null,
            cep: onlyDigits(form.cep) || null,
            street: form.street.trim() || null,
            number: form.number.trim() || null,
            complement: form.complement.trim() || null,
            neighborhood: form.neighborhood.trim() || null,
            city: form.city.trim() || null,
            state: form.state.trim().toUpperCase() || null,
            notes: form.notes.trim() || null,
        });
        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                return 'A tabela de clientes ainda não foi criada no Supabase. Execute o SQL de criação primeiro.';
            }
            return 'Erro ao salvar: ' + error.message;
        }
        setShowNewModal(false);
        showToast('Cliente cadastrado com sucesso!');
        loadData();
        return null;
    };

    // Filter
    const q = search.toLowerCase();
    const filteredRegistered = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        formatPhone(c.phone).includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.cpf || '').includes(q)
    );
    const filteredCatalog = catalogOnly.filter(c =>
        c.name.toLowerCase().includes(q) || formatPhone(c.phone).includes(q)
    );
    const totalCustomers = customers.length + catalogOnly.length;

    return (
        <div className="flex min-h-screen bg-mint relative">
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-forest text-white px-5 py-2.5 rounded-full font-medium text-sm shadow-xl flex items-center gap-2 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-lime flex items-center justify-center text-forest flex-shrink-0 text-[10px] font-black">✓</div>
                    {toast}
                </div>
            )}

            <Sidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-forest">Clientes</h1>
                        <p className="text-forest/50 text-sm mt-0.5">{totalCustomers} {totalCustomers === 1 ? 'cliente' : 'clientes'} no total</p>
                    </div>
                    <button onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark transition-colors shadow-sm">
                        <Plus size={16} /> Novo Cliente
                    </button>
                </div>

                {/* DB warning banner */}
                {dbError && (
                    <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-5 py-4 rounded-2xl">
                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Tabela de clientes não encontrada</p>
                            <p className="text-xs mt-1 text-amber-700">Execute o SQL de criação da tabela <code className="bg-amber-100 px-1 rounded">customers</code> no painel do Supabase para ativar o cadastro de clientes.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-card border border-mint-dark mb-5">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={16} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nome, telefone, cidade ou CPF..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={28} className="animate-spin text-forest/30" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Registered */}
                        {filteredRegistered.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-card border border-mint-dark overflow-hidden">
                                <div className="px-6 py-3 border-b border-mint-dark bg-mint/30 flex items-center gap-2">
                                    <Users size={14} className="text-forest/50" />
                                    <span className="text-xs font-bold text-forest/50 uppercase tracking-wider">Clientes Cadastrados</span>
                                    <span className="ml-auto text-xs text-forest/40">{filteredRegistered.length}</span>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-mint-dark">
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-3">Cliente</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Telefone</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Cidade</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3">Pedidos</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Total Gasto</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-mint-dark">
                                        {filteredRegistered.map(c => (
                                            <tr key={c.id}
                                                onClick={() => openRegisteredCustomer(c)}
                                                className="hover:bg-mint/40 transition-colors cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-lime/30 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-forest">{c.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-forest text-sm">{c.name}</p>
                                                            {c.cpf && <p className="text-xs text-forest/40 font-mono">{formatCPF(c.cpf)}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <p className="text-forest/70 text-sm">{formatPhone(c.phone)}</p>
                                                </td>
                                                <td className="px-4 py-4 hidden md:table-cell">
                                                    <p className="text-forest/60 text-sm">{c.city ? `${c.city}${c.state ? ` / ${c.state}` : ''}` : '—'}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <ShoppingBag size={13} className="text-forest/40" />
                                                        <span className="text-sm font-bold text-forest">{c.order_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 hidden lg:table-cell">
                                                    <span className="text-sm font-bold text-forest">{formatPrice(c.total_spent || 0)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => openRegisteredCustomer(c)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-forest/30 hover:bg-mint hover:text-forest transition-colors"
                                                            title="Editar">
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Excluir "${c.name}"?`)) return;
                                                                const supabase = createClient();
                                                                await supabase.from('customers').delete().eq('id', c.id);
                                                                setCustomers(prev => prev.filter(x => x.id !== c.id));
                                                                showToast('Cliente excluído.');
                                                            }}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-forest/30 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            title="Excluir">
                                                            <Trash2 size={13} />
                                                        </button>
                                                        <ChevronRight size={15} className="text-forest/20" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Catalog-only */}
                        {filteredCatalog.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-card border border-mint-dark overflow-hidden">
                                <div className="px-6 py-3 border-b border-mint-dark bg-amber-50/60 flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-amber-600" />
                                    <span className="text-xs font-bold text-amber-700/70 uppercase tracking-wider">Clientes do Catálogo</span>
                                    <span className="text-xs text-amber-600/60 ml-1">— identificados por pedidos</span>
                                    <span className="ml-auto text-xs text-amber-600/60">{filteredCatalog.length}</span>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-mint-dark">
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-6 py-3">Cliente</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Telefone</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3">Pedidos</th>
                                            <th className="text-left text-xs font-semibold text-forest/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Total Gasto</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-mint-dark">
                                        {filteredCatalog.map(c => (
                                            <tr key={c.phone} onClick={() => openCatalogCustomer(c)}
                                                className="hover:bg-amber-50/40 transition-colors cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-amber-700">{c.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-forest text-sm">{c.name}</p>
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Catálogo</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <p className="text-forest/70 text-sm">{formatPhone(c.phone)}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <ShoppingBag size={13} className="text-forest/40" />
                                                        <span className="text-sm font-bold text-forest">{c.order_count}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 hidden md:table-cell">
                                                    <span className="text-sm font-bold text-forest">{formatPrice(c.total_spent)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <ChevronRight size={15} className="text-forest/20" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Empty */}
                        {filteredRegistered.length === 0 && filteredCatalog.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-card border border-mint-dark py-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-mint flex items-center justify-center mb-4">
                                    <Users size={28} className="text-forest/20" />
                                </div>
                                <p className="font-semibold text-forest/50 text-sm">
                                    {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
                                </p>
                                <p className="text-forest/30 text-xs mt-1">
                                    {search ? 'Tente outro termo' : 'Cadastre seu primeiro cliente ou aguarde pedidos do catálogo'}
                                </p>
                                {!search && (
                                    <button onClick={() => setShowNewModal(true)}
                                        className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-forest text-sm font-bold hover:bg-lime-dark transition-colors">
                                        <Plus size={15} /> Cadastrar Primeiro Cliente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* New customer modal */}
            {showNewModal && (
                <NewCustomerModal
                    onClose={() => setShowNewModal(false)}
                    onSave={handleSaveNew}
                />
            )}

            {/* Registered customer drawer */}
            {selectedRegistered && (
                loadingRegisteredOrders ? (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-forest/20 backdrop-blur-sm">
                        <Loader2 size={32} className="text-white animate-spin" />
                    </div>
                ) : (
                    <RegisteredDrawer
                        customer={selectedRegistered}
                        orders={registeredOrders}
                        onClose={() => setSelectedRegistered(null)}
                        onUpdated={(updated) => {
                            setCustomers(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
                            setSelectedRegistered(null);
                            showToast('Cliente atualizado!');
                        }}
                        onDeleted={(id) => {
                            setCustomers(prev => prev.filter(c => c.id !== id));
                            setSelectedRegistered(null);
                            showToast('Cliente excluído.');
                        }}
                    />
                )
            )}

            {/* Catalog drawer */}
            {loadingCatalogOrders && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-forest/20 backdrop-blur-sm">
                    <Loader2 size={32} className="text-white animate-spin" />
                </div>
            )}
            {selectedCatalog && !loadingCatalogOrders && (
                <CatalogDrawer customer={selectedCatalog} onClose={() => setSelectedCatalog(null)} />
            )}
        </div>
    );
}
