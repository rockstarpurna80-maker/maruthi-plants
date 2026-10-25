import React from 'react';
import { motion } from 'motion/react';
import { 
  Sprout, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  Sun,
  Truck,
  Leaf,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { NURSERY_PHONE, NURSERY_LOCATION } from '../utils/whatsapp';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onViewDirections: () => void;
  totalPlantsCount: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onViewDirections,
  totalPlantsCount,
  searchQuery = '',
  onSearchChange,
  onSelectCategory,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background organic mesh */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Floating Animated Botanical Ambient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-16 -left-16 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-teal-500/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline & Animated Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Animated Location Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-sm shadow-sm"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              </motion.div>
              <span>Malladi Village, Amaravathi Road, Guntur District</span>
            </motion.div>

            {/* Main Animated Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]"
            >
              Nurturing Greenery for <span className="text-emerald-400 italic">Amaravathi & Guntur</span> Homes and Farms
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-emerald-100/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal"
            >
              Welcome to <strong>Maruthi Nursery</strong>. We cultivate kitchen garden vegetable plants (Guntur Chilli, Brinjal, Tomato, Curry Leaf, Drumstick), high-yielding grafted fruit varieties, fragrant flowering shrubs, and shade trees. Order directly via WhatsApp or visit our nursery farm on Amaravathi Road.
            </motion.p>

            {/* Interactive Search Bar in Hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="bg-emerald-950/70 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-2 max-w-xl"
            >
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onExploreCatalog();
                  }}
                  placeholder="Search vegetable plants, chilli, tomato, mango, jasmine..."
                  className="w-full pl-11 pr-24 py-3 bg-emerald-900/60 border border-emerald-600/40 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-emerald-900/90 transition-all"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange?.('')}
                      className="p-1 text-emerald-300 hover:text-white rounded-md cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Find</span>
                  </button>
                </div>
              </div>

              {/* Quick Variety Filter Chips in Hero */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Popular:</span>
                </span>
                {[
                  { label: '🌶️ Vegetable Plants', query: '', category: 'Vegetable Plants' },
                  { label: '🌶️ Guntur Chilli', query: 'Chilli', category: 'Vegetable Plants' },
                  { label: '🍆 Guttu Vankaya', query: 'Brinjal', category: 'Vegetable Plants' },
                  { label: '🥭 Banganapalli Mango', query: 'Mango', category: 'Fruit Plants' },
                  { label: '🌿 Curry Leaf', query: 'Curry Leaf', category: 'Vegetable Plants' },
                  { label: '🌸 Jasmine', query: 'Jasmine', category: 'Flowering Plants' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSearchChange?.(chip.query);
                      if (chip.category) onSelectCategory?.(chip.category);
                      onExploreCatalog();
                    }}
                    className="px-2 py-0.5 rounded-md bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-600/40 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Action CTA Buttons with Hover Physics */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreCatalog}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Sprout className="w-5 h-5" />
                <span>Explore {totalPlantsCount}+ Plant Varieties</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent('Namaste Maruthi Nursery! I would like to order plants and check availability at your Malladi Village location.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-emerald-400/30 text-white rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Order on WhatsApp</span>
              </motion.a>

              <button
                onClick={onViewDirections}
                className="px-4 py-3.5 text-emerald-300 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions</span>
              </button>
            </motion.div>

            {/* Quality Checklist Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-800/70 text-xs sm:text-sm text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Genuine Grafted Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Wholesale & Retail Supply</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Acclimatized to AP Climate</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Visual Showcase Card with Floating Interactive Badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Floating Top Badge with smooth drift */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-4 -left-4 z-20 bg-stone-900/90 text-white border border-emerald-500/40 px-3.5 py-2 rounded-2xl shadow-xl items-center gap-2 backdrop-blur-md"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">30+ Years Heritage</p>
                <p className="text-xs font-semibold text-white">Direct Farm Saplings</p>
              </div>
            </motion.div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-700/50 bg-emerald-900/60 p-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80"
                  alt="Maruthi Nursery rows of healthy saplings in Malladi"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-stone-900 shadow-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Direct Farm Nursery</span>
                      </div>
                      <h2 className="text-base font-bold text-stone-950 font-serif">
                        Maruthi Nursery — Malladi
                      </h2>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Amaravathi Road, Guntur • +91 9515369395
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                        7 AM - 6:30 PM
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1 font-medium">Open All 7 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Strip Below Photo */}
              <div className="mt-3 px-2 flex items-center justify-between text-xs text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call: +91 9515369395</span>
                </span>
                <span className="text-emerald-400/60">•</span>
                <span>Bulk Agro Orders Welcome</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
