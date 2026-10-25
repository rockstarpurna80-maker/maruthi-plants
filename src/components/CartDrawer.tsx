import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  MessageCircle, 
  ShoppingBag, 
  MapPin, 
  Truck, 
  Store, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CartItem } from '../types/nursery';
import { getCartOrderWhatsAppUrl, NURSERY_NAME, NURSERY_PHONE } from '../utils/whatsapp';
import { submitOrderToFirestore } from '../services/nurseryService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (plantId: string, quantity: number) => void;
  onRemoveItem: (plantId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home_delivery' | 'bulk_transport'>('store_pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add plants from our catalog to order.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your name and phone number for the nursery order confirmation.');
      return;
    }

    if (deliveryType === 'home_delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your delivery address in Guntur/Amaravathi area.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare items summary
      const itemsSummary = items
        .map((i) => `${i.plant.name} (Qty: ${i.quantity}, ₹${i.plant.price * i.quantity})`)
        .join(', ');

      // 2. Save order to Firestore
      try {
        await submitOrderToFirestore({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryType,
          deliveryAddress: deliveryType !== 'store_pickup' ? deliveryAddress.trim() : 'Store Pickup at Malladi',
          itemsSummary,
          items: items.map((i) => ({
            plantId: i.plant.id,
            plantName: i.plant.name,
            quantity: i.quantity,
            price: i.plant.price,
          })),
          totalAmount,
          notes: notes.trim(),
        });
      } catch (err) {
        console.warn('Firestore order record non-fatal error:', err);
      }

      // 3. Generate WhatsApp checkout URL
      const whatsappUrl = getCartOrderWhatsAppUrl(items, totalAmount, {
        name: customerName,
        phone: customerPhone,
        deliveryType,
        address: deliveryAddress,
        notes,
      });

      // 4. Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // 5. Success state
      setOrderSuccess(true);
      onClearCart();
    } catch (err) {
      console.error('Order checkout error:', err);
      setErrorMessage('Failed to submit order. Please try direct WhatsApp message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Slide-out drawer panel */}
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Your Nursery Order
              </h3>
              <p className="text-xs text-stone-500">
                Maruthi Nursery • Malladi Village
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {orderSuccess ? (
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-serif font-bold text-stone-900">
              Order Sent to Maruthi Nursery!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              Your itemized order details have been prepared for WhatsApp chat (+91 9515369395) and registered in our nursery system. We will confirm your plant availability shortly.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800"
              >
                Continue Browsing Plants
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Items List & Order Form */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Items in Cart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <span>Selected Plants ({items.length})</span>
                  {items.length > 0 && (
                    <button
                      onClick={onClearCart}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">Your cart is empty</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Browse our catalog to select mango, guava, jasmine, or indoor plants.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {items.map((item) => (
                      <div key={item.plant.id} className="py-3 flex items-center justify-between gap-3">
                        <img
                          src={item.plant.imageUrl}
                          alt={item.plant.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {item.plant.name}
                          </h5>
                          {item.plant.teluguName && (
                            <p className="text-[11px] text-emerald-700 truncate">
                              {item.plant.teluguName}
                            </p>
                          )}
                          <p className="text-xs text-stone-600 font-semibold mt-0.5">
                            ₹{item.plant.price} each
                          </p>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                            <button
                              onClick={() => onUpdateQuantity(item.plant.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-stone-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.plant.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-stone-200 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.plant.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove plant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery / Fulfillment Preferences */}
              {items.length > 0 && (
                <form id="cart-order-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Fulfillment Preference
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('store_pickup')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryType === 'store_pickup'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <Store className="w-4 h-4 text-emerald-700 mb-1" />
                      <div className="font-bold text-[11px]">Self Pickup</div>
                      <div className="text-[10px] text-stone-500">Malladi Nursery</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('home_delivery')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryType === 'home_delivery'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-700 mb-1" />
                      <div className="font-bold text-[11px]">Home Delivery</div>
                      <div className="text-[10px] text-stone-500">Guntur / Amaravathi</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('bulk_transport')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryType === 'bulk_transport'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-700 mb-1" />
                      <div className="font-bold text-[11px]">Farm Transport</div>
                      <div className="text-[10px] text-stone-500">Bulk Saplings</div>
                    </button>
                  </div>

                  {/* Customer Information Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ramesh Varma"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    {deliveryType !== 'store_pickup' && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Delivery Address & Landmark *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="House/Plot no, Village/Colony, Amaravathi Road, Guntur"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        ></textarea>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Special Instructions / Visiting Date (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Need grafted plants with large soil rootball"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Checkout Bar */}
            {items.length > 0 && (
              <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-500 font-medium">Estimated Total:</span>
                  <span className="text-2xl font-serif font-bold text-stone-950">
                    ₹{totalAmount}
                  </span>
                </div>

                <button
                  type="submit"
                  form="cart-order-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>
                    {isSubmitting ? 'Confirming Order...' : 'Submit & Order on WhatsApp'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-stone-500">
                  Sends directly to Maruthi Nursery WhatsApp (+91 9515369395). No pre-payment required online.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
