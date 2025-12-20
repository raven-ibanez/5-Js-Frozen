import React from 'react';
import { MenuItem } from '../types';
import { Category } from '../hooks/useCategories';


interface MenuSectionProps {
    category: Category;
    subcategories: Category[];
    items: MenuItem[];
    onSubcategoryClick: (id: string) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
    category,
    subcategories,
    items,
    onSubcategoryClick
}) => {
    // Local state removed in favor of parent navigation
    // const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

    // Filter items based on active subcategory - Logic moved to CategoryView
    // const displayedItems = activeSubcategory
    //     ? items.filter(item => item.category === activeSubcategory)
    //     : [];

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
                            onClick={() => onSubcategoryClick(sub.id)}
                            className="p-6 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-3 group bg-white text-gray-600 border border-gray-200 hover:border-meat-red hover:shadow-md"
                        >
                            {sub.image_url ? (
                                <div className="w-16 h-16 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110">
                                    <img
                                        src={sub.image_url}
                                        alt={sub.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{sub.icon}</span>
                            )}
                            <span className="text-lg font-bold font-display text-gray-800 group-hover:text-meat-red">{sub.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default MenuSection;
