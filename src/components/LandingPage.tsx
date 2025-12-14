import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { categories, loading } = useCategories();

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/shop?category=${categoryId}`);
    };

    return (
        <div className="min-h-screen bg-meat-light font-sans">

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-gray-600 rounded-lg py-4 mb-10 shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white text-center">
                        Select your Category
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-48 h-48 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-8 animate-slide-up">
                        {categories
                            .filter(c => !c.parent_id) // Only show main categories
                            .map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="group w-48 h-48 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-meat-red hover:text-meat-red transition-all duration-200 flex flex-col items-center justify-center gap-4"
                                >
                                    <div className="text-5xl text-gray-700 group-hover:text-meat-red transition-colors duration-200">
                                        {category.icon}
                                    </div>
                                    <span className="text-lg font-bold text-gray-700 group-hover:text-meat-red transition-colors duration-200">
                                        {category.name}
                                    </span>
                                </button>
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LandingPage;
