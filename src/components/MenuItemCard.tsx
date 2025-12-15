import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  const calculatePrice = () => {
    // Use variation price if selected, otherwise effective/base price
    let price = selectedVariation
      ? selectedVariation.price
      : (item.effectivePrice || item.basePrice);

    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price * modalQuantity;
  };

  const handleAddToCart = () => {
    setModalQuantity(1);
    setShowCustomization(true);
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, modalQuantity, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>

      <div className={`bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group animate-scale-in border border-gray-100 flex flex-col h-full ${!item.available ? 'opacity-60 grayscale' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${item.image ? 'hidden' : ''}`}>
            <span className="text-4xl">🥩</span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {item.isOnDiscount && item.discountPrice && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                SALE
              </span>
            )}
            {item.popular && (
              <span className="bg-meat-gold text-meat-black text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                POPULAR
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4 flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xl font-display font-bold text-meat-dark leading-tight group-hover:text-meat-red transition-colors duration-200">{item.name}</h4>
            </div>
            <p className={`text-sm leading-relaxed line-clamp-2 ${!item.available ? 'text-gray-400' : 'text-gray-500'}`}>
              {!item.available ? 'Currently Unavailable' : item.description}
            </p>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {item.variations && item.variations.length > 0 && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {item.variations.length} Options
              </span>
            )}
            {item.addOns && item.addOns.length > 0 && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Add-ons
              </span>
            )}
          </div>

          {/* Pricing & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div>
              {item.isOnDiscount && item.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs line-through">₱{item.basePrice.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-meat-red">₱{item.discountPrice.toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-meat-dark">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {!item.available ? (
                <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-full text-sm font-bold cursor-not-allowed">
                  Sold Out
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-meat-red text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-lg shadow-red-200 transition-all duration-300"
                  aria-label="Add to cart"
                >
                  <Plus className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                  <button
                    onClick={handleDecrement}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-meat-dark shadow-sm hover:scale-110 transition-transform"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-meat-dark text-sm">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-8 h-8 flex items-center justify-center bg-meat-red text-white rounded-full shadow-sm hover:scale-110 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Customize {item.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Choose your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Main Item Quantity and Measurement */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {item.showMeasurement ? `Weight (${item.measurementUnit})` : 'Quantity'}
                  </h4>
                  <div className="flex flex-col items-end">
                    {item.showMeasurement ? (
                      <div className="mb-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={modalQuantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setModalQuantity(val);
                          }}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right font-medium text-gray-900"
                          placeholder={`Enter ${item.measurementUnit}`}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-1 mb-2">
                        <button
                          onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="font-bold text-gray-900 w-8 text-center">{modalQuantity}</span>
                        <button
                          onClick={() => setModalQuantity(modalQuantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    )}

                    {item.showMeasurement && item.measurementValue && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          Total Price: ₱{(calculatePrice()).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Choose Size</h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedVariation?.id === variation.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="font-medium text-gray-900">{variation.name}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">
                          ₱{variation.price.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{addOn.name}</span>
                              <div className="text-sm text-gray-600">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(2)} each` : 'Free'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-red-100 rounded-xl p-1 border border-red-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1.5 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                  >
                                    <Minus className="h-3 w-3 text-red-600" />
                                  </button>
                                  <span className="font-semibold text-gray-900 min-w-[24px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1.5 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                  >
                                    <Plus className="h-3 w-3 text-red-600" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between text-2xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-red-600">₱{calculatePrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ₱{calculatePrice().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;