import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Sprout, 
  Sparkles, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { Plant, PlantCategory, CartItem } from '../types/nursery';
import { PlantCard } from './PlantCard';

interface CatalogSectionProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onAddToCart: (plant: Plant) => void;
  cartItems: CartItem[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const CATEGORIES: ('All' | PlantCategory)[] = [
  'All',
  'Vegetable Plants',
  'Fruit Plants',
  'Flowering Plants',
  'Indoor & Air Purifying',
  'Medicinal & Herbal',
  'Avenue & Shade Trees',
  'Bonsai & Exotic',
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  plants,
  onSelectPlant,
  onAddToCart,
  cartItems,
  isLoading = false,
  searchQuery: externalSearchQuery,
  onSearchChange,
  selectedCategory: externalCategory,
  onCategoryChange,
}) => {
  // Support both controlled & uncontrolled usage
  const [internalCategory, setInternalCategory] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  const selectedCategory = externalCategory !== undefined ? externalCategory : internalCategory;
  const setSelectedCategory = onCategoryChange || setInternalCategory;

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;

  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSunlight, setSelectedSunlight] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // Cart helper to check if item is in cart
  const cartPlantIds = useMemo(() => new Set(cartItems.map((item) => item.plant.id)), [cartItems]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: plants.length };
    for (const p of plants) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [plants]);

  // Enhanced Filtered and sorted plants
  const filteredPlants = useMemo(() => {
    return plants
      .filter((plant) => {
        // Category filter
        if (selectedCategory !== 'All' && plant.category !== selectedCategory) {
          return false;
        }

        // Multi-attribute search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const tokens = q.split(/\s+/).filter(Boolean);

          const plantName = plant.name.toLowerCase();
          const telugu = plant.teluguName?.toLowerCase() || '';
          const scientific = plant.scientificName?.toLowerCase() || '';
          const category = plant.category.toLowerCase();
          const desc = plant.description.toLowerCase();
          const sunlight = plant.sunlight.toLowerCase();
          const soil = plant.soil?.toLowerCase() || '';
          const size = plant.size?.toLowerCase() || '';
          const careTipsText = plant.careTips
            ? `${plant.careTips.wateringFrequency || ''} ${plant.careTips.sunlightNeeds || ''} ${plant.careTips.soilPreference || ''} ${plant.careTips.fertilizerSchedule || ''} ${plant.careTips.pruningTips || ''} ${plant.careTips.seasonalCare || ''} ${plant.careTips.growthNotes || ''}`.toLowerCase()
            : '';

          // Exact full match across any field including care guide
          const hasDirectMatch =
            plantName.includes(q) ||
            telugu.includes(q) ||
            scientific.includes(q) ||
            category.includes(q) ||
            desc.includes(q) ||
            sunlight.includes(q) ||
            soil.includes(q) ||
            size.includes(q) ||
            careTipsText.includes(q);

          if (!hasDirectMatch) {
            // Check if every token matches at least one field
            const tokenMatch = tokens.every(
              (tok) =>
                plantName.includes(tok) ||
                telugu.includes(tok) ||
                scientific.includes(tok) ||
                category.includes(tok) ||
                desc.includes(tok) ||
                careTipsText.includes(tok)
            );
            if (!tokenMatch) return false;
          }
        }

        // In Stock filter
        if (inStockOnly && !plant.inStock) {
          return false;
        }

        // Sunlight filter
        if (selectedSunlight !== 'All' && plant.sunlight !== selectedSunlight) {
          return false;
        }

        // Max price filter
        if (plant.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: featured first, then bestSeller, then id
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return 0;
      });
  }, [plants, selectedCategory, searchQuery, inStockOnly, selectedSunlight, maxPrice, sortBy]);

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    searchQuery !== '' || 
    inStockOnly || 
    selectedSunlight !== 'All' || 
    maxPrice < 1000;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setInStockOnly(false);
    setSelectedSunlight('All');
    setMaxPrice(1000);
    setSortBy('featured');
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>Nursery Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 mt-2">
            Explore Handpicked Plants & Trees
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Acclimatized saplings grown at Malladi Village on Amaravathi Road. Available for immediate farm pickup or regional delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-900 font-bold">{filteredPlants.length}</strong> of {plants.length} plants
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        
        {/* Search bar + Sort selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plant name, Telugu vernacular (e.g. మామిడి, నిమ్మ, మల్లె), variety, or care..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-stone-50/50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-3 pr-8 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="featured">Sort: Featured & Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`py-3 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                showAdvancedFilters || hasActiveFilters
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-stone-200 text-stone-700 hover:border-stone-300 bg-stone-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Variety Quick-Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick Varieties:</span>
          </span>
          {[
            { label: '🥭 Mango (మామిడి)', query: 'Mango', category: 'Fruit Plants' },
            { label: '🍋 Guava & Citrus', query: 'Guava', category: 'Fruit Plants' },
            { label: '🌸 Mogra Jasmine', query: 'Jasmine', category: 'Flowering Plants' },
            { label: '🪴 Air Purifiers', query: 'Air Purifying', category: 'Indoor & Air Purifying' },
            { label: '🎋 Adenium Bonsai', query: 'Bonsai', category: 'Bonsai & Exotic' },
            { label: '🌿 Tulsi & Herbal', query: 'Tulsi', category: 'Medicinal & Herbal' },
            { label: '🌳 Shade Trees', query: 'Shade', category: 'Avenue & Shade Trees' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(chip.query);
                if (chip.category) setSelectedCategory(chip.category);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap border transition-all cursor-pointer ${
                searchQuery.toLowerCase().includes(chip.query.toLowerCase())
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 hover:text-stone-900'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Category Pills with Live Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-thin border-t border-stone-100">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-900/60 text-emerald-100' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Search & Filter Indicator Bar */}
        {hasActiveFilters && (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Found <strong>{filteredPlants.length}</strong> {filteredPlants.length === 1 ? 'variety' : 'varieties'}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                {inStockOnly ? ' (In Stock only)' : ''}
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            {/* Stock Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>In Stock only (Ready for pickup)</span>
              </label>
            </div>

            {/* Sunlight Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Sunlight Requirement
              </label>
              <select
                value={selectedSunlight}
                onChange={(e) => setSelectedSunlight(e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 cursor-pointer"
              >
                <option value="All">All Light Levels</option>
                <option value="Full Sun">Full Sun (Farms / Terrace)</option>
                <option value="Partial Shade">Partial Shade</option>
                <option value="Indirect Bright">Indirect Bright (Indoors)</option>
                <option value="Low to Medium Light">Low to Medium Light</option>
              </select>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-stone-700 mb-1">
                <span>Max Price:</span>
                <span className="font-bold text-emerald-800">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-stone-200 rounded-xl"></div>
              <div className="h-5 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-200 rounded w-1/2"></div>
              <div className="h-8 bg-stone-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Empty State with Variety Suggestions */}
      {!isLoading && filteredPlants.length === 0 && (
        <div className="text-center py-14 px-4 bg-white rounded-3xl border border-stone-200 my-4 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-stone-900">
              No plants found {searchQuery ? `matching "${searchQuery}"` : ''}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
              We couldn't find an exact match in our online catalog. You can try searching by common name or ask us directly on WhatsApp.
            </p>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="pt-2">
            <span className="text-xs text-stone-500 block mb-2 font-medium">Try searching for popular plant varieties:</span>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {['Mango', 'Guava', 'Lemon', 'Jasmine', 'Hibiscus', 'Bougainvillea', 'Areca Palm', 'Bonsai'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setSelectedCategory('All');
                  }}
                  className="px-3 py-1 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 text-xs font-semibold transition-colors cursor-pointer border border-stone-200 hover:border-emerald-300"
                >
                  +{term}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <a
              href={`https://wa.me/919515369395?text=${encodeURIComponent(`Hello Maruthi Nursery, I am looking for plant variety "${searchQuery || 'custom'}" at your Malladi nursery.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Ask Availability on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Plants Grid */}
      {!isLoading && filteredPlants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onSelect={onSelectPlant}
              onAddToCart={onAddToCart}
              isInCart={cartPlantIds.has(plant.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
