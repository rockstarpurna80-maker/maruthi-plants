import React from 'react';
import { 
  Sun, 
  Droplets, 
  MessageCircle, 
  Plus, 
  Check, 
  Sparkles,
  Info,
  Sprout,
  Layers
} from 'lucide-react';
import { Plant } from '../types/nursery';
import { getPlantOrderWhatsAppUrl } from '../utils/whatsapp';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  onAddToCart: (plant: Plant) => void;
  isInCart?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onSelect,
  onAddToCart,
  isInCart = false,
}) => {
  const discountPercent = plant.originalPrice && plant.originalPrice > plant.price
    ? Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onSelect(plant)}
      >
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/75 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
          {plant.category}
        </span>

        {/* Stock / Best Seller Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {plant.bestSeller && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              Popular
            </span>
          )}
          {plant.inStock ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-semibold tracking-wider shadow-sm">
              In Stock ({plant.stock})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-semibold tracking-wider shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-rose-500 text-white text-xs font-bold shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Floating Quick-Scan Care Icons on Image (Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-medium shadow-sm border border-white/10"
            title={`Light Needs: ${plant.careTips?.sunlightNeeds || plant.sunlight}`}
          >
            <Sun className="w-3 h-3 text-amber-400 fill-amber-400/30 shrink-0" />
            <span>{plant.sunlight === 'Full Sun' ? 'Sun' : plant.sunlight.split(' ')[0]}</span>
          </div>

          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-medium shadow-sm border border-white/10"
            title={`Watering Frequency: ${plant.careTips?.wateringFrequency || plant.watering}`}
          >
            <Droplets className="w-3 h-3 text-sky-400 fill-sky-400/30 shrink-0" />
            <span>{plant.watering === 'When Top Soil Dries' ? 'Dry Soil' : plant.watering === 'Twice a Week' ? '2x/wk' : plant.watering}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          
          {/* Plant Name & Telugu local vernacular */}
          <div className="cursor-pointer" onClick={() => onSelect(plant)}>
            <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
              {plant.name}
            </h3>
            {plant.teluguName && (
              <p className="text-xs font-medium text-emerald-700 font-sans tracking-wide">
                {plant.teluguName}
              </p>
            )}
            {plant.scientificName && (
              <p className="text-[11px] italic text-stone-600 line-clamp-1 font-serif">
                {plant.scientificName}
              </p>
            )}
          </div>

          {/* DEDICATED CARE SCAN MATRIX: Sun, Water, Soil Indicators */}
          <div 
            onClick={() => onSelect(plant)}
            className="p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group/care"
            title="Click to view detailed horticultural care instructions"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Sprout className="w-3 h-3 text-emerald-600" />
                <span>Care Requirements</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 group-hover/care:underline flex items-center gap-0.5">
                <span>Full Guide</span>
                <span>→</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Light Indicator */}
              <div 
                className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-amber-200/60 shadow-2xs hover:border-amber-300 transition-colors"
                title={plant.careTips?.sunlightNeeds || `Sunlight: ${plant.sunlight}`}
              >
                <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold text-stone-600 uppercase">Light</span>
                  <span className="block text-[11px] font-bold text-stone-800 truncate">
                    {plant.sunlight}
                  </span>
                </div>
              </div>

              {/* Water Indicator */}
              <div 
                className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-sky-200/60 shadow-2xs hover:border-sky-300 transition-colors"
                title={plant.careTips?.wateringFrequency || `Watering: ${plant.watering}`}
              >
                <div className="w-6 h-6 rounded-md bg-sky-100/90 text-sky-700 flex items-center justify-center shrink-0">
                  <Droplets className="w-3.5 h-3.5 fill-sky-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold text-stone-600 uppercase">Water</span>
                  <span className="block text-[11px] font-bold text-stone-800 truncate">
                    {plant.watering}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Soil / Ready Size Strip */}
            {(plant.soil || plant.size) && (
              <div className="mt-2 pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                {plant.soil && (
                  <span className="truncate max-w-[65%]" title={plant.careTips?.soilPreference || plant.soil}>
                    🌱 <span className="text-stone-700 font-medium">{plant.soil.split(' ')[0]} {plant.soil.split(' ')[1] || 'soil'}</span>
                  </span>
                )}
                {plant.size && (
                  <span className="shrink-0 text-stone-600 font-medium">
                    📏 {plant.size}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description snippet */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {plant.description}
          </p>
        </div>

        {/* Pricing & Order Actions */}
        <div className="pt-4 mt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-stone-950 font-serif">
                ₹{plant.price}
              </span>
              {plant.originalPrice && plant.originalPrice > plant.price && (
                <span className="text-xs text-stone-600 line-through">
                  ₹{plant.originalPrice}
                </span>
              )}
            </div>
            <button
              onClick={() => onSelect(plant)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Care Guide</span>
            </button>
          </div>

          {/* Direct WhatsApp + Add to Cart buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={getPlantOrderWhatsAppUrl(plant, 1)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              title="Order this plant directly via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            <button
              onClick={() => onAddToCart(plant)}
              disabled={!plant.inStock}
              className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !plant.inStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : isInCart
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-stone-900 hover:bg-stone-850 text-white'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">In Cart</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
