import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuSection from './MenuSection';


// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity }) => {
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);

      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);



  React.useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 hidden">
          <h2 className="text-4xl font-display font-bold text-meat-dark mb-4">Our Menu</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of frozen steaks, ground meat, and specialty cuts,
            perfect for your next family gathering or barbecue event.
          </p>
        </div>

        {categories
          .filter(c => !c.parent_id) // Filter for main categories
          .map((category) => {
            const subcategories = categories.filter(sub => sub.parent_id === category.id);

            // Get all items for this main category (direct + subcategory items)
            const subcategoryIds = subcategories.map(sub => sub.id);
            const allCategoryItems = menuItems.filter(item =>
              item.category === category.id || subcategoryIds.includes(item.category)
            );

            if (allCategoryItems.length === 0) return null;

            return (
              <MenuSection
                key={category.id}
                category={category}
                subcategories={subcategories}
                items={allCategoryItems}
                cartItems={cartItems}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
              />
            );
          })}
      </main>
    </>
  );
};

export default Menu;