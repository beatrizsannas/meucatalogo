'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CustomizationOption {
    name: string;
    price: number;
}

interface WholesaleCartItem {
    product: any;
    quantity: number;
    hasLabel: boolean; // kept for legacy compat
    selectedCustomizations: CustomizationOption[];
}

interface WholesaleCartContextType {
    items: WholesaleCartItem[];
    addToCart: (product: any, minQty: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number, minQty: number) => void;
    toggleLabel: (productId: string) => void;
    toggleCustomization: (productId: string, customization: CustomizationOption) => void;
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

    const addToCart = (product: any, minQty: number) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: minQty, hasLabel: false, selectedCustomizations: [] }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number, minQty: number) => {
        if (quantity < minQty) {
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

    // Legacy toggle for backward compat (toggles first customization)
    const toggleLabel = (productId: string) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.product.id !== productId) return item;
                const customs: CustomizationOption[] = item.product.wholesale_customizations || [];
                if (customs.length === 0) return { ...item, hasLabel: !item.hasLabel };
                // Toggle all customizations on/off
                if (item.selectedCustomizations.length > 0) {
                    return { ...item, hasLabel: false, selectedCustomizations: [] };
                } else {
                    return { ...item, hasLabel: true, selectedCustomizations: [...customs] };
                }
            })
        );
    };

    const toggleCustomization = (productId: string, customization: CustomizationOption) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.product.id !== productId) return item;
                const exists = item.selectedCustomizations.find(c => c.name === customization.name);
                let newCustomizations: CustomizationOption[];
                if (exists) {
                    newCustomizations = item.selectedCustomizations.filter(c => c.name !== customization.name);
                } else {
                    newCustomizations = [...item.selectedCustomizations, customization];
                }
                return {
                    ...item,
                    selectedCustomizations: newCustomizations,
                    hasLabel: newCustomizations.length > 0,
                };
            })
        );
    };

    const clearCart = () => {
        setItems([]);
        setIsCartOpen(false);
    };

    const cartTotal = items.reduce(
        (total, item) => {
            let itemPrice = item.product.wholesale_price || 0;
            let itemTotal = itemPrice * item.quantity;
            // Sum selected customizations
            const customsTotal = item.selectedCustomizations.reduce((sum, c) => sum + (c.price || 0), 0);
            itemTotal += customsTotal * item.quantity;
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
                toggleCustomization,
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
