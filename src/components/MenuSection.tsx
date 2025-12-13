import React, { useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { Category } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';

interface MenuSectionProps {
    category: Category;
    subcategories: Category[];
    items: MenuItem[];
    cartItems: CartItem[];
    addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
    updateQuantity: (id: string, quantity: number) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
    category,
    subcategories,
    items,
    cartItems,
    addToCart,
    updateQuantity
}) => {
    const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

    // Filter items based on active subcategory
    const displayedItems = activeSubcategory
        ? items.filter(item => item.category === activeSubcategory)
        : [];

    // Always render structure if we have subcategories, even if no items shown yet
    if (items.length === 0 && subcategories.length === 0) return null;

    return (
        <section id={category.id} className="mb-16">
            <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                <span className="text-4xl mr-4">{category.icon}</span>
                <h3 className="text-4xl font-display font-medium text-meat-dark">{category.name}</h3>
            </div>

            {/* Subcategory Tabs */}
            {subcategories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {subcategories.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => setActiveSubcategory(sub.id)}
                            className={`p-6 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-3 group ${activeSubcategory === sub.id
                                ? 'bg-meat-red text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-meat-red hover:shadow-md'
                                }`}
                        >
                            <span className={`text-4xl transition-transform duration-300 ${activeSubcategory === sub.id ? 'scale-110' : 'group-hover:scale-110'
                                }`}>{sub.icon}</span>
                            <span className={`text-lg font-bold font-display ${activeSubcategory === sub.id ? 'text-white' : 'text-gray-800 group-hover:text-meat-red'
                                }`}>{sub.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => {
                    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                    return (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onAddToCart={addToCart}
                            quantity={cartItem?.quantity || 0}
                            onUpdateQuantity={updateQuantity}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default MenuSection;
