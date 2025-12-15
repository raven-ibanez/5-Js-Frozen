import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useSettings } from '../hooks/useSettings';
import { LocationPicker } from './LocationPicker';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You could also log this to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h3 className="font-bold mb-2">Something went wrong loading the map.</h3>
          <p className="text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm underline hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onPlaceOrder: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice: itemsTotal, onBack, onPlaceOrder }) => {
  const { paymentMethods } = usePaymentMethods();
  const { settings } = useSettings();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');

  // Delivery states
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);

  // Calculate total price including delivery fee
  const finalTotal = itemsTotal + (serviceType === 'delivery' ? deliveryFee : 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const calculateDeliveryFee = (lat: number, lng: number) => {
    if (!settings.store_lat || !settings.store_lng) return 0;

    // Calculate distance using Haversine formula
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat - settings.store_lat);
    const dLon = deg2rad(lng - settings.store_lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(settings.store_lat)) * Math.cos(deg2rad(lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    setDistance(parseFloat(d.toFixed(2)));

    // Calculate Fee
    // First 1 km = Base Rate
    // Succeeding km = Per KM Rate

    let fee = settings.delivery_rate_base;
    if (d > 1) {
      fee += (d - 1) * settings.delivery_rate_per_km;
    }

    // Round to nearest whole number or 2 decimal places
    return Math.ceil(fee);
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setDeliveryLocation({ lat, lng });
    const fee = calculateDeliveryFee(lat, lng);
    setDeliveryFee(fee);
  };

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const timeInfo = serviceType === 'pickup'
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';

    const googleMapsLink = deliveryLocation
      ? `https://www.google.com/maps?q=${deliveryLocation.lat},${deliveryLocation.lng}`
      : '';

    const orderDetails = `
🛒 5J's Frozen ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `
🛵 Delivery Info:
   • Map Location: ${googleMapsLink}
   • Distance: ${distance} km
   • Fee: ₱${deliveryFee}
   ${landmark ? `• Landmark: ${landmark}` : ''}
` : ''}
${serviceType === 'pickup' ? `⏰ Pickup Time: ${timeInfo}` : ''}


📋 ORDER DETAILS:
${cartItems.map(item => {
      let itemDetails = `• ${item.name}`;
      if (item.selectedVariation) {
        itemDetails += ` (${item.selectedVariation.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        itemDetails += ` + ${item.selectedAddOns.map(addOn =>
          addOn.quantity && addOn.quantity > 1
            ? `${addOn.name} x${addOn.quantity}`
            : addOn.name
        ).join(', ')}`;
      }
      itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
      return itemDetails;
    }).join('\n')}

💵 Items Total: ₱${itemsTotal}
${serviceType === 'delivery' ? `🛵 Delivery Fee: ₱${deliveryFee}` : ''}
💰 TOTAL AMOUNT: ₱${finalTotal}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
${(selectedPaymentMethod?.account_number || selectedPaymentMethod?.qr_code_url)
        ? '📸 Payment Screenshot: Please attach your payment receipt screenshot'
        : ''
      }

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing 5J's Frozen! 🥟
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/61584534464621?text=${encodedMessage}`;

    // Clear cart before/after opening messenger
    onPlaceOrder();

    window.open(messengerUrl, '_blank');
  };

  const isDetailsValid = customerName && contactNumber &&
    (serviceType !== 'delivery' || deliveryLocation) &&
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime));

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-display font-semibold text-meat-dark ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-medium text-meat-dark mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                  <div>
                    <h4 className="font-medium text-black">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-red-200 pt-4 space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₱{itemsTotal}</span>
              </div>
              {serviceType === 'delivery' && (
                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery Fee ({distance} km):</span>
                  <span>₱{deliveryFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-display font-semibold text-meat-dark pt-2">
                <span>Total:</span>
                <span>₱{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-medium text-meat-dark mb-6">Customer Information</h2>

            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Service Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pickup', label: 'Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${serviceType === option.value
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                        }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${pickupTime === option.value
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                            }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address (Map) */}
              {serviceType === 'delivery' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Delivery Location *</label>
                    <p className="text-xs text-gray-600 mb-2">Please pin your exact delivery location on the map.</p>
                    <ErrorBoundary>
                      <LocationPicker
                        initialLat={settings.store_lat}
                        initialLng={settings.store_lng}
                        onLocationSelect={handleLocationSelect}
                      />
                    </ErrorBoundary>
                    {distance > 0 && (
                      <div className="mt-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Distance: {distance} km
                        </span>
                        <span className="font-bold">Fee: ₱{deliveryFee}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Landmark / Specific Instructions</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., White gate, near basketball court"
                    />
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${isDetailsValid
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-display font-semibold text-meat-dark ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-display font-medium text-meat-dark mb-6">Choose Payment Method</h2>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${paymentMethod === method.id
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                  }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (selectedPaymentMethod.account_number || selectedPaymentMethod.qr_code_url) ? (
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-black mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-black font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Subtotal: ₱{itemsTotal}</p>
                    {serviceType === 'delivery' && (
                      <p className="text-sm text-gray-600">Delivery Fee: ₱{deliveryFee}</p>
                    )}
                    <p className="text-xl font-semibold text-black mt-2">Total Amount: ₱{finalTotal}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {selectedPaymentMethod.qr_code_url && (
                    <>
                      <img
                        src={selectedPaymentMethod.qr_code_url}
                        alt={`${selectedPaymentMethod.name} QR Code`}
                        className="w-32 h-32 rounded-lg border-2 border-red-300 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                        }}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
              <h3 className="font-medium text-black mb-2">Cash on Delivery</h3>
              <p className="text-gray-600">
                Please prepare the exact amount of <span className="font-bold">₱{finalTotal}</span> for payment upon {serviceType === 'delivery' ? 'delivery' : 'pickup'}.
              </p>
            </div>
          )}

          {/* Reference Number */}
          {selectedPaymentMethod && (selectedPaymentMethod.account_number || selectedPaymentMethod.qr_code_url) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">📸 Payment Proof Required</h4>
              <p className="text-sm text-gray-700">
                After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-display font-medium text-meat-dark mb-6">Final Order Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {customerName}</p>
              <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
              <p className="text-sm text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Distance: {distance} km</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-gray-600">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn =>
                        addOn.quantity && addOn.quantity > 1
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-red-200 pt-4 mb-6">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₱{itemsTotal}</span>
            </div>
            {serviceType === 'delivery' && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>₱{deliveryFee}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-2xl font-display font-semibold text-meat-dark mt-2">
              <span>Total:</span>
              <span>₱{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]"
          >
            Place Order via Messenger
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;