import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import { useMenu } from './hooks/useMenu';
import { useCategories } from './hooks/useCategories';

function MainApp() {
  const [searchParams] = useSearchParams();
  const cart = useCart();
  const { menuItems } = useMenu();
  const { categories } = useCategories();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

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

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };



  // Filter menu items based on selected category (including subcategories)
  const filteredMenuItems = React.useMemo(() => {
    if (selectedCategory === 'all') return menuItems;

    // Get all subcategory IDs for the selected category
    const subcategoryIds = categories
      .filter(c => c.parent_id === selectedCategory)
      .map(c => c.id);

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

      {/* Show Hero only in menu view */}
      {currentView === 'menu' && <Hero />}


      {currentView === 'menu' && (
        <Menu
          menuItems={filteredMenuItems}
          addToCart={cart.addToCart}
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
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