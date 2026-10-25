import React, { useState } from 'react';
import { 
  X, 
  Sun, 
  Droplets, 
  Layers, 
  Ruler, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  MapPin, 
  Calendar,
  Share2,
  Sprout,
  Scissors,
  ShieldCheck,
  Copy,
  CheckCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { Plant } from '../types/nursery';
import { getPlantOrderWhatsAppUrl, NURSERY_LOCATION, NURSERY_PHONE } from '../utils/whatsapp';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  onAddToCart: (plant: Plant, quantity: number) => void;
  isInCart?: boolean;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  onAddToCart,
  isInCart = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedTips, setCopiedTips] = useState(false);
  const [careTab, setCareTab] = useState<'schedule' | 'nutrition' | 'seasonal'>('schedule');

  if (!plant) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${plant.name} - Maruthi Nursery Malladi`,
        text: `Check out ${plant.name} at Maruthi Nursery on Amaravathi Road, Guntur. Price: ₹${plant.price}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const careTips = plant.careTips || {
    wateringFrequency: `Water regularly when topsoil is dry (${plant.watering.toLowerCase()}). Ensure good drainage to avoid root rot.`,
    sunlightNeeds: `Thrives in ${plant.sunlight.toLowerCase()} for optimal health and growth in Andhra tropical conditions.`,
    soilPreference: plant.soil || 'Rich well-draining garden soil enriched with vermicompost.',
    fertilizerSchedule: 'Apply organic compost or balanced plant food once every 30 to 45 days during active growth.',
    pruningTips: 'Prune dry leaves and dead twigs periodically to stimulate healthy fresh shoots.',
    seasonalCare: 'Provide light shade cloth or mulching during peak summer heat (April-May) to conserve moisture.',
    growthNotes: 'Grown and acclimated for high survival rate in Guntur and Amaravathi regional soils.'
  };

  const handleCopyCareTips = () => {
    const text = `🌱 Care Guide for ${plant.name} (${plant.category}) - Maruthi Nursery, Malladi
☀️ Sunlight: ${careTips.sunlightNeeds || plant.sunlight}
💧 Watering: ${careTips.wateringFrequency || plant.watering}
🪴 Soil: ${careTips.soilPreference || plant.soil || 'Well-draining loamy soil'}
🌿 Fertilization: ${careTips.fertilizerSchedule || 'Organic compost monthly'}
✂️ Pruning: ${careTips.pruningTips || 'Prune dry shoots periodically'}
🛡️ Seasonal: ${careTips.seasonalCare || 'Protect during hot summer days'}
📌 Visit us at Amaravathi Road, Malladi Village, Guntur!`;

    navigator.clipboard.writeText(text);
    setCopiedTips(true);
    setTimeout(() => setCopiedTips(false), 2500);
  };

  const totalPrice = plant.price * quantity;

  // WhatsApp consultation link for specific plant advice
  const whatsappConsultationUrl = `https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent(
    `Hello Maruthi Nursery, I am interested in ${plant.name} (₹${plant.price}). Could you please advise on planting instructions and care in Guntur area?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 my-4 flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 shadow-md transition-all hover:scale-105 cursor-pointer"
          aria-label="Close plant detail dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Photo & Quick Badges */}
        <div className="md:w-5/12 relative bg-stone-100 flex-shrink-0 min-h-[260px] md:min-h-full">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/20 to-transparent md:bg-gradient-to-t md:from-stone-950/60 md:via-transparent"></div>
          
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md text-white text-xs font-semibold tracking-wide uppercase shadow-sm">
              {plant.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider block">Nursery Direct Price</span>
                <span className="text-3xl font-bold font-serif">₹{plant.price}</span>
                {plant.originalPrice && plant.originalPrice > plant.price && (
                  <span className="ml-2 text-sm text-stone-300 line-through">₹{plant.originalPrice}</span>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
                plant.inStock ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
              }`}>
                {plant.inStock ? `${plant.stock} Ready in Stock` : 'Out of Stock'}
              </span>
            </div>

            {/* Quick Location Badge */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-stone-200 bg-black/40 backdrop-blur-md p-2 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Malladi Village, Amaravathi Rd, Guntur</span>
            </div>
          </div>
        </div>

        {/* Right Side: Care Tips, Specs, Description & Actions */}
        <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto flex-1 space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  Authentic Sapling
                </span>
                {plant.bestSeller && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                    ★ Best Seller
                  </span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-stone-100 cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-1.5">
              {plant.name}
            </h2>

            {plant.teluguName && (
              <p className="text-sm font-semibold text-emerald-800 mt-0.5">
                {plant.teluguName}
              </p>
            )}

            {plant.scientificName && (
              <p className="text-xs italic text-stone-500 font-serif mt-0.5">
                {plant.scientificName}
              </p>
            )}
          </div>

          {/* About / Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>Plant Overview</span>
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {plant.description}
            </p>
          </div>

          {/* COMPREHENSIVE CARE TIPS & HORTICULTURAL GUIDE */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-950 uppercase tracking-wider">
                    Care Tips & Cultivation Guide
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Tailored for Andhra Pradesh & Guntur regional climate
                  </p>
                </div>
              </div>

              {/* Copy Care Instructions Button */}
              <button
                type="button"
                onClick={handleCopyCareTips}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy care tips to clipboard"
              >
                {copiedTips ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy Care Tips</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 4-Grid Diagnostic Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sunlight</span>
                </div>
                <span className="font-bold text-stone-900 text-xs mt-1">{plant.sunlight}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/60 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-sky-800 font-semibold text-[11px]">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>Watering</span>
                </div>
                <span className="font-bold text-stone-900 text-xs mt-1">{plant.watering}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ideal Soil</span>
                </div>
                <span className="font-bold text-stone-900 text-xs mt-1 truncate" title={plant.soil || 'Red loamy soil'}>
                  {plant.soil ? (plant.soil.length > 18 ? plant.soil.substring(0, 18) + '...' : plant.soil) : 'Red loamy soil'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-purple-800 font-semibold text-[11px]">
                  <Ruler className="w-3.5 h-3.5 text-purple-600" />
                  <span>Ready Size</span>
                </div>
                <span className="font-bold text-stone-900 text-xs mt-1 truncate" title={plant.size || 'Standard Nursery'}>
                  {plant.size || 'Standard Sapling'}
                </span>
              </div>
            </div>

            {/* Care Category Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
              <button
                type="button"
                onClick={() => setCareTab('schedule')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  careTab === 'schedule'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                Water & Light
              </button>
              <button
                type="button"
                onClick={() => setCareTab('nutrition')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  careTab === 'nutrition'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                Soil & Fertilizer
              </button>
              <button
                type="button"
                onClick={() => setCareTab('seasonal')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  careTab === 'seasonal'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                Pruning & Climate
              </button>
            </div>

            {/* Care Tab Content */}
            <div className="text-xs space-y-3 min-h-[90px]">
              {careTab === 'schedule' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <Droplets className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Watering Frequency & Tips</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.wateringFrequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Sunlight & Exposure Needs</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.sunlightNeeds}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {careTab === 'nutrition' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <Layers className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Soil & Potting Mix Recommendation</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.soilPreference || plant.soil || 'Rich red soil mixed with 30% organic vermicompost and good aeration.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Fertilizer Schedule</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.fertilizerSchedule}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {careTab === 'seasonal' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <Scissors className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Pruning & Canopy Training</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.pruningTips}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 font-semibold mb-0.5">Seasonal Protection & Guntur Climate</strong>
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        {careTips.seasonalCare}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Growth Notes Footer snippet */}
              {careTips.growthNotes && (
                <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Agronomist Note:</strong> {careTips.growthNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expert Guidance Callout */}
          <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-100/70 p-3 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Free on-site potting and planting consultation at <strong>Malladi Village</strong>.</span>
            </div>
            <a
              href={whatsappConsultationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 font-bold whitespace-nowrap text-[11px] hover:underline flex items-center gap-0.5"
            >
              <span>Ask Plant Expert</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          {/* Quantity & Order Subtotal */}
          <div className="pt-2 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-stone-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(plant.stock || 99, quantity + 1))}
                    className="px-3 py-1.5 text-sm font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider block">Order Subtotal</span>
                <span className="block text-xl font-bold font-serif text-emerald-950">
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp + Add to Cart buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={getPlantOrderWhatsAppUrl(plant, quantity)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-center cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Order via WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onAddToCart(plant, quantity);
                }}
                disabled={!plant.inStock}
                className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !plant.inStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isInCart
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-stone-900 hover:bg-stone-850 text-white'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>In Nursery Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
