'use client';

import { useEffect, useState } from 'react';
import { useWholesaleCart } from '@/app/context/WholesaleCartContext';
import { ShoppingCart, X, Minus, Plus, Trash2, Send, ChevronLeft, Boxes, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
    profileId?: string;
    whatsapp?: string;
};

export default function WholesaleCartDrawer({ profileId, whatsapp }: Props) {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, toggleLabel, clearCart, cartTotal, cartCount } = useWholesaleCart();

    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<'cart' | 'form' | 'success'>('cart');

    const [customerName, setCustomerName] = useState('');
    const [customerCNPJ, setCustomerCNPJ] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [lastOrderDetails, setLastOrderDetails] = useState<{ id: string, text: string, total: number, items: any[] } | null>(null);

    // --- Input Masking Logic ---
    const formatCNPJCPF = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length <= 11) {
            return v
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2');
        }
        return v
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 18);
    };
    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => setCustomerCNPJ(formatCNPJCPF(e.target.value));

    const formatPhone = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length <= 11) {
            if (v.length <= 2) return v.replace(/(\d{2})/, '($1');
            if (v.length <= 6) return v.replace(/(\d{2})(\d{4})/, '($1) $2');
            if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value.substring(0, 15);
    };
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(formatPhone(e.target.value));
    // ---------------------------

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!isCartOpen) {
            const timer = setTimeout(() => {
                setView('cart');
                setLastOrderDetails(null);
                setCustomerName(''); setCustomerCNPJ(''); setCustomerPhone(''); setCustomerAddress('');
                setFormError('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isCartOpen]);

    if (!mounted) return null;

    const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const handleCheckoutStep1 = () => { if (items.length === 0) return; setView('form'); };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!customerName || !customerCNPJ || !customerPhone) {
            setFormError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        setSubmitting(true);

        const orderId = `ATC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Build whatsapp message
        let message = `*Novo Pedido de Atacado: ${orderId}*\n\n`;
        message += `*Dados do Cliente:*\n`;
        message += `Empresa/Nome: ${customerName}\nCNPJ/CPF: ${customerCNPJ}\nTelefone: ${customerPhone}\n`;
        if (customerAddress) message += `Endereço: ${customerAddress}\n`;
        message += `\n*Itens do Pedido:*\n`;
        items.forEach((item, index) => {
            const labelPriceText = (item.hasLabel && item.product.wholesale_label_price) ? ` (Etiqueta: +${formatPrice(item.product.wholesale_label_price * item.quantity)})` : '';
            message += `${index + 1}. *${item.product.name}*\n   Qtd: ${item.quantity} x ${formatPrice(item.product.wholesale_price)}${labelPriceText}\n   Subtotal: ${formatPrice((item.product.wholesale_price * item.quantity) + (item.hasLabel ? (item.product.wholesale_label_price! * item.quantity) : 0))}\n\n`;
        });
        message += `*Total do Pedido: ${formatPrice(cartTotal)}*\n\nAguardando confirmação e cálculo do frete!`;

        // Save to Supabase (We can reuse 'orders' table, maybe storing the type)
        if (profileId) {
            const supabase = createClient();
            await supabase.from('orders').insert({
                id: orderId,
                profile_id: profileId,
                customer_name: customerName,
                customer_cpf: customerCNPJ.replace(/\D/g, ''),
                customer_phone: customerPhone.replace(/\D/g, ''),
                customer_address: customerAddress,
                items: items.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    image_url: item.product.image_url,
                    quantity: item.quantity,
                    price: item.product.wholesale_price,
                    wholesale_label: item.hasLabel,
                    wholesale_label_price: item.product.wholesale_label_price
                })),
                total: cartTotal,
                status: 'pendente',
            });
        }

        setLastOrderDetails({ id: orderId, text: message, total: cartTotal, items: [...items] });
        setView('success');
        setSubmitting(false);
    };

    const sendToWhatsApp = () => {
        if (!lastOrderDetails) return;
        const encodedMessage = encodeURIComponent(lastOrderDetails.text);
        const cleanWhatsapp = whatsapp ? whatsapp.replace(/\D/g, '') : '';
        const waUrl = `https://wa.me/55${cleanWhatsapp}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
        clearCart();
        setIsCartOpen(false);
    };

    const closeSuccessViewAndClearCart = () => {
        clearCart();
        setIsCartOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[420px] bg-amber-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-amber-200 overflow-hidden ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-amber-200 bg-white">
                    <div className="flex items-center gap-3">
                        {view === 'form' ? (
                            <button
                                onClick={() => setView('cart')}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-amber-800 hover:bg-amber-100 hover:text-amber-900 transition-colors -ml-2"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center">
                                <Boxes size={20} />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <h2 className="text-xl font-extrabold text-forest leading-tight">
                                {view === 'cart' && 'Pedido Atacado'}
                                {view === 'form' && 'Seus Dados'}
                                {view === 'success' && 'Pedido Concluído'}
                            </h2>
                            {view === 'cart' && (
                                <span className="text-xs text-forest/40 uppercase tracking-widest font-bold">Carrinho</span>
                            )}
                        </div>

                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-forest/40 hover:bg-amber-100 hover:text-forest transition-colors flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                {view === 'success' && lastOrderDetails && (
                    <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col items-center">
                        <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mb-4 mt-2">
                            <Send size={28} className="text-amber-700 ml-1" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-forest mb-1">Pedido Criado!</h3>
                        <p className="text-forest/60 mb-6 text-sm">
                            Nº do Pedido: <strong>{lastOrderDetails.id}</strong>
                        </p>

                        <div className="w-full bg-amber-50 rounded-2xl p-4 mb-8 border border-amber-200 text-sm">
                            <h4 className="font-bold text-forest mb-3">Resumo do Pedido</h4>
                            <div className="space-y-3 mb-4">
                                {lastOrderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div className="flex-1 text-forest pr-2">
                                            <span className="font-bold text-amber-700 mr-2">{item.quantity}x</span>
                                            {item.product.name}
                                            {item.hasLabel && (
                                                <p className="text-xs text-amber-600 mt-0.5 ml-6">+ Personalização (Etiqueta) {formatPrice((item.product.wholesale_label_price || 0) * item.quantity)}</p>
                                            )}
                                        </div>
                                        <div className="font-bold text-forest text-right">
                                            {formatPrice((item.product.wholesale_price * item.quantity) + (item.hasLabel ? ((item.product.wholesale_label_price || 0) * item.quantity) : 0))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-amber-200 pt-3 flex justify-between items-center">
                                <span className="font-bold text-forest">Total (Atacado)</span>
                                <span className="font-extrabold text-forest text-lg">
                                    {formatPrice(lastOrderDetails.total)}
                                </span>
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-auto">
                            <button
                                onClick={sendToWhatsApp}
                                className="w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-full text-base hover:bg-amber-500 transition-all shadow-sm active:scale-95 border border-amber-500"
                            >
                                <Send size={18} />
                                Enviar pedido no whatsapp
                            </button>
                            <button
                                onClick={closeSuccessViewAndClearCart}
                                className="w-full py-3 text-sm font-bold text-forest/50 hover:text-forest hover:bg-amber-100 rounded-full transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}

                {view === 'form' && (
                    <div className="flex-1 overflow-y-auto bg-white">
                        <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                            <p className="text-forest/60 text-sm mb-6">
                                Precisamos de alguns dados da sua empresa ou seu cadastro para faturar seu pedido de atacado.
                            </p>

                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">
                                    Razão Social / Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Sua Empresa LTDA"
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-amber-50/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">
                                    CNPJ ou CPF *
                                </label>
                                <input
                                    type="text"
                                    value={customerCNPJ}
                                    onChange={handleCNPJChange}
                                    placeholder="00.000.000/0001-00"
                                    maxLength={18}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-amber-50/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">
                                    Telefone / WhatsApp *
                                </label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={handlePhoneChange}
                                    placeholder="(11) 99999-9999"
                                    maxLength={15}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-amber-50/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5 flex items-center justify-between">
                                    Endereço de Entrega
                                    <span className="text-xs font-normal text-forest/40">(opcional)</span>
                                </label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Sua rua, Número, Bairro, CEP..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-amber-50/50 resize-none"
                                />
                            </div>

                            {formError && (
                                <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">{formError}</p>
                            )}

                            <div className="pt-4 border-t border-amber-200 mt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-full text-base hover:bg-amber-500 transition-all shadow-sm active:scale-95 border border-amber-500 disabled:opacity-50"
                                >
                                    Confirmar Pedido de Atacado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('cart')}
                                    className="w-full py-3 mt-2 text-sm font-bold text-forest/50 hover:text-forest hover:bg-amber-100 rounded-full transition-colors"
                                >
                                    Voltar para o carrinho
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'cart' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 bg-transparent">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-amber-900/40 space-y-4">
                                    <Boxes size={48} className="opacity-40" />
                                    <p className="font-medium">Seu carrinho de atacado está vazio</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 px-6 py-2.5 bg-amber-400 text-amber-900 text-sm font-bold rounded-full hover:bg-amber-500 transition-colors shadow-sm"
                                    >
                                        Continuar escolhendo
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-20">
                                    {items.map((item) => {
                                        const minQty = item.product.wholesale_min_qty || 1;
                                        const isMinQty = item.quantity <= minQty;

                                        return (
                                            <div key={item.product.id} className="flex flex-col gap-2 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm relative">
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0 border border-amber-100">
                                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start gap-2 pr-6">
                                                            <h3 className="font-bold text-forest text-sm leading-tight line-clamp-2">
                                                                {item.product.name}
                                                            </h3>
                                                        </div>
                                                        <div className="mt-1 flex flex-col">
                                                            <p className="font-extrabold text-amber-700 text-sm">
                                                                {formatPrice(item.product.wholesale_price)}
                                                                <span className="text-xs font-medium text-forest/40 line-through ml-2">Varejo: {formatPrice(item.product.price)}</span>
                                                            </p>
                                                        </div>

                                                        {/* Controls */}
                                                        <div className="mt-auto flex items-center justify-between pt-2">
                                                            <p className="text-xs text-forest/50 font-medium">Subtotal: {formatPrice(item.product.wholesale_price * item.quantity)}</p>
                                                            <div className="flex items-center gap-3 bg-amber-50 rounded-full px-2 py-1 border border-amber-200">
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, minQty)}
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isMinQty ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-amber-800 hover:bg-white border-transparent'}`}
                                                                    title={isMinQty ? "Remover do carrinho" : "Diminuir"}
                                                                >
                                                                    {isMinQty ? <Trash2 size={12} /> : <Minus size={12} />}
                                                                </button>
                                                                <span className="text-xs font-bold text-forest w-5 text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, minQty)}
                                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-amber-800 hover:bg-white transition-colors"
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="absolute top-3 right-3 text-forest/30 hover:text-red-500 p-1 bg-white rounded-full transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>

                                                {/* Personalização Box */}
                                                {item.product.wholesale_label && (
                                                    <div className={`mt-1 flex items-center justify-between gap-2 p-2 rounded-xl border transition-colors cursor-pointer ${item.hasLabel ? 'bg-amber-100/50 border-amber-300' : 'bg-gray-50 border-gray-200 hover:bg-amber-50 hover:border-amber-200'}`} onClick={() => toggleLabel(item.product.id)}>
                                                        <div className="flex items-center gap-2">
                                                            <Tag size={13} className={item.hasLabel ? 'text-amber-700' : 'text-gray-400'} />
                                                            <span className={`text-[11px] font-semibold ${item.hasLabel ? 'text-amber-900' : 'text-gray-500'}`}>
                                                                Adicionar Personalização (Etiqueta)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {item.product.wholesale_label_price && (
                                                                <span className={`text-[11px] font-bold ${item.hasLabel ? 'text-amber-700' : 'text-gray-500'}`}>
                                                                    +{formatPrice(item.product.wholesale_label_price)}/unid
                                                                </span>
                                                            )}
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.hasLabel ? 'border-amber-500 bg-amber-400 text-white' : 'border-gray-300 bg-white'}`}>
                                                                {item.hasLabel && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {item.quantity === minQty && (
                                                     <p className="text-[10px] text-amber-700/60 font-medium text-center mt-1">Quantidade mínima permitida: {minQty}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer (Total & Checkout) */}
                        {items.length > 0 && (
                            <div className="p-5 bg-white border-t border-amber-200 shadow-up">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-forest/60 text-sm font-medium">Subtotal Itens</span>
                                    <span className="text-forest font-bold">{formatPrice(cartTotal - items.filter(i => i.hasLabel).reduce((sum, i) => sum + ((i.product.wholesale_label_price || 0) * i.quantity), 0))}</span>
                                </div>
                                {items.filter(i => i.hasLabel).length > 0 && (
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-amber-700 text-sm font-medium flex items-center gap-1.5"><Tag size={12}/> Personalização</span>
                                        <span className="text-amber-700 font-bold">{formatPrice(items.filter(i => i.hasLabel).reduce((sum, i) => sum + ((i.product.wholesale_label_price || 0) * i.quantity), 0))}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-forest/60 text-sm font-medium">Frete a combinar</span>
                                    <span className="text-forest/60 text-sm font-medium">-</span>
                                </div>
                                <div className="flex items-center justify-between mb-5 pt-3 border-t border-amber-200/50">
                                    <span className="text-forest text-lg font-extrabold uppercase tracking-tight">Total Atacado</span>
                                    <span className="text-2xl font-extrabold text-amber-600">{formatPrice(cartTotal)}</span>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <button
                                        onClick={handleCheckoutStep1}
                                        className="w-full flex items-center justify-center gap-2 text-amber-900 bg-amber-400 border border-amber-500 font-extrabold py-3.5 rounded-full text-base hover:bg-amber-500 transition-all shadow-sm active:scale-95"
                                    >
                                        Finalizar Pedido
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className="w-full py-2.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        Limpar Carrinho
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Global Floating Cart Button - visible only when cart is not open and has items */}
            {cartCount > 0 && !isCartOpen && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-amber-400 text-amber-900 p-4 rounded-full shadow-lg border border-amber-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
                >
                    <div className="relative">
                        <Boxes size={24} />
                        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-amber-400 shadow-sm">
                            {cartCount}
                        </span>
                    </div>
                </button>
            )}
        </>
    );
}
