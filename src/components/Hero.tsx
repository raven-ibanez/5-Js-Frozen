import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-meat-dark overflow-hidden">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-meat-dark z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-meat-red/20 via-transparent to-transparent z-0 animate-pulse"></div>
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 text-center">
        <div className="mb-6 inline-block animate-fade-in">
          <span className="py-2 px-6 rounded-full border border-meat-gold/30 text-meat-gold text-sm font-medium tracking-widest uppercase bg-black/30 backdrop-blur-sm">
            Premium Quality Meats
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 animate-slide-up leading-tight drop-shadow-2xl">
          TASTE THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-meat-red to-red-600">DIFFERENCE</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-slide-up delay-100">
          From premium cuts to daily essentials, we bring the finest frozen goods.
        </p>


      </div>
    </section>
  );
};

export default Hero;