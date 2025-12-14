import React from 'react';
import { ShoppingCart, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const navigate = useNavigate();
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meat-red via-red-500 to-meat-red"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={onMenuClick}
            className="flex items-center space-x-3 group"
          >
            {loading ? (
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-meat-gold blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
                <img
                  src={siteSettings?.site_logo || "/logo.jpg"}
                  alt={siteSettings?.site_name || "5J's Frozen"}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md relative z-10 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.jpg";
                  }}
                />
              </div>
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-display font-bold tracking-tight text-meat-dark group-hover:text-meat-red transition-colors duration-200">
                {loading ? <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" /> : "5J's Frozen"}
              </h1>
              <span className="text-[10px] items-center font-medium tracking-widest text-gray-500 uppercase hidden sm:block">Premium Frozen Goods</span>
            </div>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-3 text-gray-600 hover:text-meat-red hover:bg-red-50 rounded-full transition-all duration-200 group"
              title="Back to Home"
            >
              <Home className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
            </button>

            <button
              onClick={onCartClick}
              className="relative p-3 text-gray-600 hover:text-meat-red hover:bg-red-50 rounded-full transition-all duration-200 group"
            >
              <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-meat-red text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-bounce-gentle border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;