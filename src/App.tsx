import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';

import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import CategoryView from './components/CategoryView';
import { useMenu } from './hooks/useMenu';
import { useCategories } from './hooks/useCategories';

function MainApp() {
  const [searchParams] = useSearchParams();
  const cart = useCart();
  const { menuItems } = useMenu();
  const { categories } = useCategories();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout' | 'category'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedCategoryViewId, setSelectedCategoryViewId] = React.useState<string | null>(null);

  // Initialize from URL params
  React.useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    const viewParam = searchParams.get('view');
    if (viewParam === 'cart') {
      setCurrentView('cart');
    }
  }, [searchParams]);

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout' | 'category') => {
    setCurrentView(view);
  };



  // Filter menu items based on selected category (including subcategories)
  const filteredMenuItems = React.useMemo(() => {
    if (selectedCategory === 'all') return menuItems;

    // Get all subcategory IDs for the selected category
    const subcategoryIds = categories
      .filter(c => c.parent_id === selectedCategory)
      .map(c => c.id);

    // If viewing a specific subcategory page
    if (currentView === 'category' && selectedCategoryViewId) {
      return menuItems.filter(item => item.category === selectedCategoryViewId);
    }

    return menuItems.filter(item =>
      item.category === selectedCategory || subcategoryIds.includes(item.category)
    );
  }, [selectedCategory, menuItems, categories]);

  return (
    <div className="min-h-screen bg-meat-light font-sans">
      <Header
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
      />

      {/* Show Hero only in menu view - REMOVED */}
      {/* {currentView === 'menu' && <Hero />} */}


      {currentView === 'menu' && (
        <Menu
          menuItems={filteredMenuItems}
          onSubcategoryClick={(id) => {
            setSelectedCategoryViewId(id);
            handleViewChange('category');
            window.scrollTo(0, 0);
          }}
        />
      )}

      {currentView === 'category' && selectedCategoryViewId && (
        <CategoryView
          categoryId={selectedCategoryViewId}
          items={filteredMenuItems}
          cartItems={cart.cartItems}
          addToCart={cart.addToCart}
          updateQuantity={cart.updateQuantity}
          onBack={() => {
            handleViewChange('menu');
            setSelectedCategoryViewId(null);
          }}
        />
      )}

      {currentView === 'cart' && (
        <Cart
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
          onPlaceOrder={cart.clearCart}
        />
      )}

      {currentView === 'menu' && (
        <FloatingCartButton
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;