'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/app/data/products'; // fallback type se precisar

interface WholesaleCartItem {
    product: any; // Using any or product type expanded for wholesale
    quantity: number;
    hasLabel: boolean;
}

interface WholesaleCartContextType {
    items: WholesaleCartItem[];
    addToCart: (product: any, minQty: number, hasLabel?: boolean) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number, minQty: number) => void;
    toggleLabel: (productId: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const WholesaleCartContext = createContext<WholesaleCartContextType | undefined>(undefined);

export function WholesaleCartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WholesaleCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product: any, minQty: number, hasLabel: boolean = false) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Add directly with minimum quantity required by wholesale
            return [...prev, { product, quantity: minQty, hasLabel }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number, minQty: number) => {
        if (quantity < minQty) {
            // No atacado, se baixar do mínimo a gente tenta remover
            if (quantity <= 0) {
                 removeFromCart(productId);
            }
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const toggleLabel = (productId: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, hasLabel: !item.hasLabel } : item
            )
        );
    }

    const clearCart = () => {
        setItems([]);
        setIsCartOpen(false);
    };

    const cartTotal = items.reduce(
        (total, item) => {
            let itemPrice = item.product.wholesale_price || 0;
            let itemTotal = itemPrice * item.quantity;
            if (item.hasLabel && item.product.wholesale_label_price) {
                itemTotal += (item.product.wholesale_label_price * item.quantity);
            }
            return total + itemTotal;
        },
        0
    );

    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <WholesaleCartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleLabel,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </WholesaleCartContext.Provider>
    );
}

export function useWholesaleCart() {
    const context = useContext(WholesaleCartContext);
    if (context === undefined) {
        throw new Error('useWholesaleCart must be used within a WholesaleCartProvider');
    }
    return context;
}
