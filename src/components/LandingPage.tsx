import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import Header from './Header';
import { useCart } from '../hooks/useCart';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { categories, loading } = useCategories();
    const cart = useCart();

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/shop?category=${categoryId}`);
    };

    const handleCartClick = () => {
        navigate('/shop?view=cart');
    };

    return (
        <div className="min-h-screen bg-meat-light font-sans">
            <Header
                cartItemsCount={cart.getTotalItems()}
                onCartClick={handleCartClick}
                onMenuClick={() => navigate('/')}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-meat-dark mb-6 animate-fade-in">
                        Select your Category
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up">
                        Choose from our premium selection of frozen delights
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto animate-slide-up">


                        {categories
                            .filter(c => !c.parent_id) // Only show main categories
                            .map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="group relative h-80 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden text-left border border-gray-100"
                                >
                                    {/* Decorative Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white z-0"></div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-meat-red/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-meat-red/10 transition-colors duration-500"></div>

                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10"></div>

                                    <div className="relative z-20 p-8 h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-gray-50">
                                                {category.icon}
                                            </div>
                                            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-100">
                                                Explore
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-4xl font-display font-bold text-meat-dark group-hover:text-meat-red transition-colors duration-200 mb-2 leading-tight">
                                                {category.name}
                                            </h3>
                                            <div className="h-1 w-12 bg-meat-red transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LandingPage;
