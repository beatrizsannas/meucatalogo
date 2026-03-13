'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCart, X, Minus, Plus, Trash2, Send, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
    profileId?: string;
    whatsapp?: string;
    brandColor?: string;
};

export default function CartDrawer({ profileId, whatsapp, brandColor }: Props) {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<'cart' | 'form' | 'success'>('cart');

    const [customerName, setCustomerName] = useState('');
    const [customerCPF, setCustomerCPF] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [lastOrderDetails, setLastOrderDetails] = useState<{ id: string, text: string, total: number, items: any[] } | null>(null);

    // --- Input Masking Logic ---
    const formatCPF = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length <= 11) {
            return v
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2');
        }
        return value.substring(0, 14);
    };
    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => setCustomerCPF(formatCPF(e.target.value));

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
                setCustomerName(''); setCustomerCPF(''); setCustomerPhone(''); setCustomerAddress('');
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
        if (!customerName || !customerCPF || !customerPhone) {
            setFormError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        setSubmitting(true);

        const orderId = `PED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Build whatsapp message
        let message = `*Novo Pedido: ${orderId}*\n\n`;
        message += `*Dados do Cliente:*\n`;
        message += `Nome: ${customerName}\nCPF: ${customerCPF}\nTelefone: ${customerPhone}\n`;
        if (customerAddress) message += `Endereço: ${customerAddress}\n`;
        message += `\n*Itens do Pedido:*\n`;
        items.forEach((item, index) => {
            message += `${index + 1}. *${item.product.name}*\n   Qtd: ${item.quantity} x ${formatPrice(item.product.price)}\n   Subtotal: ${formatPrice(item.product.price * item.quantity)}\n\n`;
        });
        message += `*Total do Pedido: ${formatPrice(cartTotal)}*\n\nAguardando confirmação!`;

        // Save to Supabase if profileId is available
        if (profileId) {
            const supabase = createClient();
            await supabase.from('orders').insert({
                id: orderId,
                profile_id: profileId,
                customer_name: customerName,
                customer_cpf: customerCPF,
                customer_phone: customerPhone.replace(/\D/g, ''),
                customer_address: customerAddress,
                items: items.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
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
                    className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-mint-dark bg-white">
                    <div className="flex items-center gap-3">
                        {view === 'form' ? (
                            <button
                                onClick={() => setView('cart')}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-forest/40 hover:bg-mint hover:text-forest transition-colors -ml-2"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-lime/20 text-lime-dark flex items-center justify-center">
                                <ShoppingCart size={20} />
                            </div>
                        )}

                        <h2 className="text-xl font-extrabold text-forest">
                            {view === 'cart' && 'Seu Carrinho'}
                            {view === 'form' && 'Seus Dados'}
                            {view === 'success' && 'Pedido Concluído'}
                        </h2>

                        {view === 'cart' && cartCount > 0 && (
                            <span className="bg-forest text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-forest/40 hover:bg-mint hover:text-forest transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                {view === 'success' && lastOrderDetails && (
                    // Success View
                    <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col items-center">
                        <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mb-4 mt-2">
                            <Send size={28} className="text-lime-dark ml-1" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-forest mb-1">Pedido Criado!</h3>
                        <p className="text-forest/60 mb-6 text-sm">
                            Nº do Pedido: <strong>{lastOrderDetails.id}</strong>
                        </p>

                        <div className="w-full bg-mint/10 rounded-2xl p-4 mb-8">
                            <h4 className="font-bold text-forest mb-3">Resumo do Pedido</h4>
                            <div className="space-y-3 mb-4">
                                {lastOrderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 text-forest">
                                            <span className="font-bold text-lime-dark mr-2">{item.quantity}x</span>
                                            {item.product.name}
                                        </div>
                                        <div className="font-bold text-forest ml-4">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-mint-dark/50 pt-3 flex justify-between items-center">
                                <span className="font-bold text-forest">Total</span>
                                <span className="font-extrabold text-forest text-lg">
                                    {formatPrice(lastOrderDetails.total)}
                                </span>
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-auto">
                            <button
                                onClick={sendToWhatsApp}
                                className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-extrabold py-4 rounded-full text-base hover:bg-lime-dark transition-all shadow-sm active:scale-95"
                            >
                                <Send size={18} />
                                Enviar pedido no whatsapp
                            </button>
                            <button
                                onClick={closeSuccessViewAndClearCart}
                                className="w-full py-3 text-sm font-bold text-forest/50 hover:text-forest hover:bg-mint rounded-full transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}

                {view === 'form' && (
                    // Customer Form View
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                            <p className="text-forest/60 text-sm mb-6">
                                Precisamos de alguns dados para registrar e facilitar a entrega do seu pedido.
                            </p>

                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="João da Silva"
                                    className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                />
                            </div>

                            {/* CPF */}
                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5">
                                    CPF *
                                </label>
                                <input
                                    type="text"
                                    value={customerCPF}
                                    onChange={handleCPFChange}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Telefone */}
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
                                    className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Endereço */}
                            <div>
                                <label className="block text-sm font-semibold text-forest mb-1.5 flex items-center justify-between">
                                    Endereço de Entrega
                                    <span className="text-xs font-normal text-forest/40">(opcional)</span>
                                </label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Rua, Número, Bairro, CEP..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-mint/30 border border-mint-dark text-forest placeholder:text-forest/30 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            {formError && (
                                <p className="text-red-500 text-sm font-medium">{formError}</p>
                            )}

                            <div className="pt-4 border-t border-mint-dark/50 mt-6">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-lime text-forest font-extrabold py-4 rounded-full text-base hover:bg-lime-dark transition-all shadow-sm active:scale-95"
                                >
                                    Confirmar Pedido
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('cart')}
                                    className="w-full py-3 mt-2 text-sm font-bold text-forest/50 hover:text-forest hover:bg-mint rounded-full transition-colors"
                                >
                                    Voltar para o carrinho
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'cart' && (
                    // Normal Cart View
                    <>
                        {/* Body (Items) */}
                        <div className="flex-1 overflow-y-auto p-6 bg-mint/10">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-forest/40 space-y-4">
                                    <ShoppingCart size={48} className="opacity-20" />
                                    <p className="font-medium">Seu carrinho está vazio</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 px-6 py-2.5 bg-mint text-forest text-sm font-semibold rounded-full hover:bg-mint-dark transition-colors"
                                    >
                                        Continuar comprando
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-mint-dark shadow-sm">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-mint-dark flex-shrink-0">
                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-forest text-sm leading-tight line-clamp-2">
                                                        {item.product.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="text-red-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <p className="font-extrabold text-forest text-sm">
                                                        {formatPrice(item.product.price)}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 bg-mint/50 rounded-full px-2 py-1 border border-mint-dark">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-forest hover:bg-white transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-xs font-bold text-forest w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-forest hover:bg-white transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer (Total & Checkout) */}
                        {items.length > 0 && (
                            <div className="p-6 bg-white border-t border-mint-dark shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-forest/60 text-sm font-medium">Subtotal</span>
                                    <span className="text-forest font-bold">{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-forest/60 text-sm font-medium">Frete a combinar</span>
                                    <span className="text-forest font-bold">-</span>
                                </div>
                                <div className="flex items-center justify-between mb-6 pt-4 border-t border-mint-dark/50">
                                    <span className="text-forest text-lg font-bold">Total</span>
                                    <span className="text-2xl font-extrabold text-forest">{formatPrice(cartTotal)}</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleCheckoutStep1}
                                        style={{ backgroundColor: brandColor || '#a8e63d' }}
                                        className="w-full flex items-center justify-center gap-2 text-forest font-extrabold py-4 rounded-full text-base hover:opacity-90 transition-all shadow-sm active:scale-95"
                                    >
                                        Avançar
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className="w-full py-3 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
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
                    className="fixed bottom-6 right-6 z-40 bg-forest text-white p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-lime text-forest text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-forest">
                            {cartCount}
                        </span>
                    </div>
                </button>
            )}
        </>
    );
}
