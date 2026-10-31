import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CafeProduct, CafeOption } from "@/services/cafe-service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
    cartId: string; // Unique ID for this specific cart entry
    product: CafeProduct;
    quantity: number;
    selectedOptions: CafeOption[];
}

interface CafeState {
    items: CartItem[];
    addItem: (product: CafeProduct, quantity: number, options: CafeOption[]) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const useCafeStore = create<CafeState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity, options) => {
                set((state) => {
                    const sortedOptions = (options || []).sort((a, b) => a.id - b.id);
                    const optionsSignature = sortedOptions.map(o => o.id).join(',');

                    const existingItemIndex = state.items.findIndex(item => {
                        if (item.product.id !== product.id) return false;
                        const itemOptionsSignature = item.selectedOptions.sort((a, b) => a.id - b.id).map(o => o.id).join(',');
                        return itemOptionsSignature === optionsSignature;
                    });

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        return { items: newItems };
                    }

                    const newItem: CartItem = {
                        cartId: Math.random().toString(36).substring(7),
                        product,
                        quantity,
                        selectedOptions: sortedOptions,
                    };
                    return { items: [...state.items, newItem] };
                });
            },
            removeItem: (cartId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.cartId !== cartId),
                }));
            },
            updateQuantity: (cartId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },
            clearCart: () => set({ items: [] }),
            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((total, item) => {
                    const basePrice = parseFloat(item.product.price);
                    const optionsPrice = item.selectedOptions.reduce(
                        (sum, opt) => sum + parseFloat(opt.price_adjustment),
                        0
                    );
                    return total + (basePrice + optionsPrice) * item.quantity;
                }, 0);
            },
        }),
        {
            name: "cafe-cart-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
