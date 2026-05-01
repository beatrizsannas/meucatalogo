'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import {
    Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2,
    User, Package, ReceiptText, X, Tag, Barcode, ArrowRight,
    AlertTriangle, Phone,
} from 'lucide-react';

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    status: string;
    image_url: string;
    description: string;
};

type CartItem = {
    product: Product;
    qty: number;
};

type CustomerSuggestion = {
    id: string;
    name: string;
    phone: string;
    cpf?: string;
};

function onlyDigits(v: string) { return (v || '').replace(/\D/g, ''); }

function formatPhone(v: string) {
    const d = onlyDigits(v);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function formatPrice(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Customer Autocomplete ─────────────────────────────────────────────
function CustomerAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder,
    icon,
    suggestions,
    filterKey,
}: {
    value: string;
    onChange: (v: string) => void;
    onSelect: (c: CustomerSuggestion) => void;
    placeholder: string;
    icon: React.ReactNode;
    suggestions: CustomerSuggestion[];
    filterKey: 'name' | 'phone';
}) {
    const [open, setOpen] = useState(false);

    const filtered = value.trim().length >= 3
        ? suggestions.filter(c => {
            const q = value.toLowerCase();
            if (filterKey === 'name') return c.name.toLowerCase().includes(q);
            return formatPhone(c.phone).includes(q) || onlyDigits(c.phone).includes(onlyDigits(q));
        }).slice(0, 6)
        : [];

    const showDropdown = open && filtered.length > 0;

    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/30 pointer-events-none z-10">{icon}</div>
            <input
                type="text"
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-mint border border-mint-dark text-forest text-xs placeholder:text-forest/30 focus:outline-none focus:ring-2 focus:ring-lime transition-all"
            />
            {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-mint-dark rounded-xl shadow-[0_8px_24px_rgba(15,41,38,0.12)] z-50 overflow-hidden">
                    <p className="text-[9px] font-bold text-forest/30 uppercase tracking-widest px-3 pt-2 pb-1">Clientes cadastrados</p>
                    {filtered.map(c => (
                        <button
                            key={c.id}
                            onMouseDown={() => { onSelect(c); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-mint transition-colors text-left"
                        >
                            <div className="w-7 h-7 rounded-full bg-lime/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px] font-bold text-forest">{c.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-forest leading-tight truncate">{c.name}</p>
                                <p className="text-[10px] text-forest/40 flex items-center gap-1">
                                    <Phone size={9} />
                                    {formatPhone(c.phone)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ——— Small Product Card ————————————————————————————————————————————
function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
    const outOfStock = product.status === 'esgotado';
    return (
        <button
            onClick={onAdd}
            disabled={outOfStock}
            className={`group relative bg-white rounded-2xl border transition-all duration-200 text-left overflow-hidden
                ${outOfStock
                    ? 'border-mint-dark opacity-50 cursor-not-allowed'
                    : 'border-mint-dark hover:border-lime hover:shadow-[0_4px_20px_rgba(208,242,116,0.35)] hover:-translate-y-0.5 cursor-pointer'
                }`}
        >
            {/* Image */}
            <div className="relative w-full aspect-square overflow-hidden bg-mint">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-forest/20" />
                    </div>
                )}
                {outOfStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full border border-red-100">Esgotado</span>
                    </div>
                )}
                {!outOfStock && (
                    <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-10 h-10 rounded-full bg-lime flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                            <Plus size={20} className="text-forest" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-sm font-semibold text-forest leading-tight line-clamp-2">{product.name}</p>
                <p className="text-xs text-forest/40 mt-0.5">{product.category}</p>
                <p className="text-sm font-bold text-forest mt-2">{formatPrice(product.price)}</p>
            </div>
        </button>
    );
}

// ——— Main PDV Page ——————————————————————————————————————————————————
export default function PDVPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>(['Todos']);
    const [selectedCat, setSelectedCat] = useState('Todos');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState('');
    const [customers, setCustomers] = useState<CustomerSuggestion[]>([]);

    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [lastOrderId, setLastOrderId] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => { loadProducts(); loadCustomers(); }, []);

    async function loadProducts() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('products')
            .select('id, name, price, category, status, image_url, description')
            .eq('profile_id', user.id)
            .order('name', { ascending: true });
        const prods = data || [];
        setProducts(prods);
        const cats = Array.from(new Set(prods.map((p: Product) => p.category).filter(Boolean)));
        setCategories(['Todos', ...cats]);
        setLoading(false);
    }

    async function loadCustomers() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('customers')
            .select('id, name, phone, cpf')
            .eq('profile_id', user.id)
            .order('name', { ascending: true });
        if (data) setCustomers(data);
    }

    // Cart helpers
    const addToCart = useCallback((product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { product, qty: 1 }];
        });
        showToast(`${product.name} adicionado`);
    }, []);

    const updateQty = (productId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i)
                .filter(i => i.qty > 0)
        );
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount('');
    };

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(''), 2000);
    }

    // Totals
    const subtotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
    const discountValue = parseFloat(discount.replace(',', '.')) || 0;
    const total = Math.max(0, subtotal - discountValue);
    const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

    // Filtered products
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const matchCat = selectedCat === 'Todos' || p.category === selectedCat;
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });

    // Finalize sale
    const handleFinalize = async () => {
        if (cart.length === 0) return;
        setIsFinalizing(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsFinalizing(false); return; }

        const items = cart.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.qty,
            price: i.product.price,
        }));

        const { data, error } = await supabase.from('orders').insert({
            profile_id: user.id,
            customer_name: customerName.trim() || 'Cliente Presencial',
            customer_phone: customerPhone.trim() || 'PDV',
            items,
            total,
            status: 'confirmado',
            date: new Date().toISOString(),
        }).select('id').single();

        setIsFinalizing(false);
        setShowConfirm(false);

        if (!error && data) {
            setLastOrderId(data.id);
            setShowSuccess(true);
            clearCart();
        } else {
            showToast('Erro ao registrar venda. Tente novamente.');
        }
    };

    return (
        <div className="flex min-h-screen bg-mint relative">
            {/* Toast */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-5 py-2.5 rounded-full font-medium text-sm shadow-xl flex items-center gap-2 pointer-events-none animate-fade-in">
                    <div className="w-4 h-4 rounded-full bg-lime flex items-center justify-center text-forest flex-shrink-0 text-[10px] font-black">✓</div>
                    {toast}
                </div>
            )}

            <Sidebar />

            {/* Main layout */}
            <div className="flex flex-1 overflow-hidden h-screen">

                {/* ── LEFT: Product Grid ─────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-white border-b border-mint-dark px-6 py-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h1 className="text-xl font-bold text-forest flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center">
                                        <ReceiptText size={15} className="text-forest" />
                                    </div>
                                    PDV — Venda Presencial
                                </h1>
                                <p className="text-forest/40 text-xs mt-0.5">Selecione os produtos e finalize a venda.</p>
                            </div>
                            <div className="bg-mint rounded-xl px-4 py-2 text-sm text-forest/60 font-medium">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                            </div>
                        </div>

                        {/* Search + Categories */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/30" size={15} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar produto..."
                                    className="w-full pl-9 pr-4 py-2 rounded-full bg-mint border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCat(cat)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCat === cat
                                            ? 'bg-forest text-white'
                                            : 'bg-mint border border-mint-dark text-forest/60 hover:border-forest/20 hover:text-forest'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-3 border-lime border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Package size={40} className="text-forest/15 mb-3" />
                                <p className="text-forest/40 text-sm font-medium">Nenhum produto encontrado</p>
                                <p className="text-forest/25 text-xs mt-1">Tente outro termo ou categoria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filtered.map(p => (
                                    <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Cart Panel ──────────────────────────────── */}
                <div className="w-80 xl:w-96 bg-white border-l border-mint-dark flex flex-col flex-shrink-0 h-full overflow-hidden">
                    {/* Cart Header */}
                    <div className="px-5 py-4 border-b border-mint-dark flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <ShoppingCart size={20} className="text-forest" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-lime text-forest text-[10px] font-black rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <span className="font-bold text-forest text-sm">Carrinho</span>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-xs text-forest/40 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={12} />
                                Limpar
                            </button>
                        )}
                    </div>

                    {/* Customer fields */}
                    <div className="px-5 py-3 border-b border-mint-dark space-y-2 flex-shrink-0">
                        <CustomerAutocomplete
                            value={customerName}
                            onChange={setCustomerName}
                            onSelect={c => { setCustomerName(c.name); setCustomerPhone(formatPhone(c.phone)); }}
                            placeholder="Nome do cliente (opcional)"
                            icon={<User size={14} />}
                            suggestions={customers}
                            filterKey="name"
                        />
                        <CustomerAutocomplete
                            value={customerPhone}
                            onChange={setCustomerPhone}
                            onSelect={c => { setCustomerName(c.name); setCustomerPhone(formatPhone(c.phone)); }}
                            placeholder="Telefone / documento (opcional)"
                            icon={<Barcode size={14} />}
                            suggestions={customers}
                            filterKey="phone"
                        />
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-16 h-16 rounded-2xl bg-mint flex items-center justify-center mb-3">
                                    <ShoppingCart size={28} className="text-forest/20" />
                                </div>
                                <p className="text-forest/40 text-sm font-medium">Carrinho vazio</p>
                                <p className="text-forest/25 text-xs mt-1">Clique nos produtos para adicionar</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="flex items-center gap-3 bg-mint rounded-xl p-2.5">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-mint-dark flex-shrink-0">
                                        {item.product.image_url
                                            ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-forest/20" /></div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-forest leading-tight line-clamp-1">{item.product.name}</p>
                                        <p className="text-xs text-forest/50 mt-0.5">{formatPrice(item.product.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => updateQty(item.product.id, -1)}
                                            className="w-6 h-6 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                        >
                                            <Minus size={10} />
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold text-forest">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.product.id, +1)}
                                            className="w-6 h-6 rounded-full bg-white border border-mint-dark flex items-center justify-center text-forest hover:bg-lime hover:border-lime transition-colors"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-forest/30 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Totals + Finalize */}
                    <div className="px-5 py-4 border-t border-mint-dark flex-shrink-0 space-y-3">
                        {/* Discount */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/30" />
                                <input
                                    type="text"
                                    value={discount}
                                    onChange={e => setDiscount(e.target.value.replace(/[^0-9,.]/g, ''))}
                                    placeholder="Desconto (R$)"
                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-mint border border-mint-dark text-forest text-xs placeholder:text-forest/30 focus:outline-none focus:ring-2 focus:ring-lime transition-all"
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-1 text-xs text-forest/60">
                            <div className="flex justify-between">
                                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                                <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
                            </div>
                            {discountValue > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Desconto</span>
                                    <span className="font-medium">- {formatPrice(discountValue)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-mint-dark">
                            <span className="font-bold text-forest text-sm">Total</span>
                            <span className="font-black text-xl text-forest">{formatPrice(total)}</span>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            onClick={() => setShowConfirm(true)}
                            className="w-full py-3.5 rounded-2xl bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(208,242,116,0.5)] hover:shadow-[0_6px_20px_rgba(208,242,116,0.6)] active:scale-[0.98]"
                        >
                            <CheckCircle2 size={17} />
                            Finalizar Venda
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Confirm Modal ────────────────────────────────────── */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,41,38,0.55)', backdropFilter: 'blur(6px)' }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 relative">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="absolute top-5 right-5 text-forest/30 hover:text-forest transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mx-auto mb-5">
                            <ReceiptText size={26} className="text-forest" />
                        </div>

                        <h2 className="text-xl font-bold text-forest text-center mb-1">Confirmar Venda</h2>
                        <p className="text-forest/50 text-sm text-center mb-5">
                            {customerName.trim() ? `Para ${customerName.trim()}` : 'Cliente Presencial'}
                        </p>

                        {/* Items summary */}
                        <div className="bg-mint rounded-2xl p-4 mb-4 space-y-1.5 max-h-40 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex justify-between text-xs">
                                    <span className="text-forest/70 line-clamp-1 flex-1 pr-2">{item.qty}x {item.product.name}</span>
                                    <span className="font-semibold text-forest flex-shrink-0">{formatPrice(item.product.price * item.qty)}</span>
                                </div>
                            ))}
                        </div>

                        {discountValue > 0 && (
                            <div className="flex justify-between text-xs text-green-600 mb-2 px-1">
                                <span>Desconto</span>
                                <span className="font-semibold">- {formatPrice(discountValue)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-mint-dark pt-3 mb-6">
                            <span className="text-sm font-bold text-forest">Total a cobrar</span>
                            <span className="text-2xl font-black text-forest">{formatPrice(total)}</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isFinalizing}
                                className="flex-1 py-3 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleFinalize}
                                disabled={isFinalizing}
                                className="flex-1 py-3 rounded-full bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isFinalizing
                                    ? <div className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                                    : <CheckCircle2 size={16} />
                                }
                                {isFinalizing ? 'Registrando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Success Modal ─────────────────────────────────────── */}
            {showSuccess && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,41,38,0.55)', backdropFilter: 'blur(6px)' }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden">
                        {/* Confetti-like accent */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-lime rounded-full opacity-20" />
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-lime rounded-full opacity-10" />

                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-lime flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(208,242,116,0.5)]">
                                <CheckCircle2 size={40} className="text-forest" />
                            </div>

                            <h2 className="text-2xl font-black text-forest mb-1">Venda Registrada!</h2>
                            <p className="text-forest/50 text-sm mb-2">O pedido foi salvo com sucesso.</p>

                            <div className="bg-mint rounded-xl px-4 py-2 inline-block mb-6">
                                <p className="text-xs text-forest/40 font-mono">#{lastOrderId.substring(0, 12).toUpperCase()}</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full py-3.5 rounded-full bg-lime text-forest font-bold text-sm hover:bg-lime-dark transition-colors flex items-center justify-center gap-2 shadow-card"
                                >
                                    <Plus size={16} />
                                    Nova Venda
                                </button>
                                <a
                                    href="/pedidos"
                                    className="w-full py-3.5 rounded-full border border-mint-dark text-forest font-semibold text-sm hover:bg-mint transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight size={15} />
                                    Ver em Pedidos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
