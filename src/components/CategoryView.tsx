import React from 'react';

import { ArrowLeft, Search } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import MenuItemCard from './MenuItemCard';
import { useCategories } from '../hooks/useCategories';

interface CategoryViewProps {
    categoryId: string;
    items: MenuItem[];
    cartItems: CartItem[];
    addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
    updateQuantity: (id: string, quantity: number) => void;
    onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({
    categoryId,
    items,
    cartItems,
    addToCart,
    updateQuantity,
    onBack,
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);
    const { categories, loading } = useCategories();
    const category = categories.find(c => c.id === categoryId);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-red"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center bg-white rounded-lg shadow-sm my-8">
                <div className="text-6xl mb-4">?</div>
                <h2 className="text-3xl font-display font-bold text-meat-dark mb-4">Category Not Found</h2>
                <p className="text-gray-600 mb-8">The category you are looking for does not exist or has been removed.</p>
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-meat-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meat-red transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-meat-dark hover:text-meat-red transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-display font-medium text-lg">Back to Menu</span>
                </button>

                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-meat-red focus:border-meat-red sm:text-sm"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-6xl">{category.icon}</span>
                    <h2 className="text-5xl font-display font-bold text-meat-dark">{category.name}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredItems.map((item) => {
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

            {items.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-xl font-light">
                    {searchQuery ? 'No items found matching your search.' : 'No items available in this category yet.'}
                </div>
            )}
        </div>
    );
};

export default CategoryView;
