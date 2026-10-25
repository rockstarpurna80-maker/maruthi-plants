import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plant, CartItem } from '../types/nursery';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { CatalogSection } from './CatalogSection';
import { LocationSection } from './LocationSection';
import { EnquirySection } from './EnquirySection';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { PlantDetailModal } from './PlantDetailModal';
import { CartDrawer } from './CartDrawer';
import { PlantAdvisorModal } from './PlantAdvisorModal';
import { PlantStudio3D } from './PlantStudio3D';
import { GeminiAssistantModal } from './GeminiAssistantModal';
import { AuthModal } from './AuthModal';
import { 
  Rotate3d, 
  Bot, 
  Video, 
  CheckCircle2, 
  Search, 
  ShoppingBag, 
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';


interface CustomerPortalProps {
  plants: Plant[];
  isLoadingPlants: boolean;
  currentUser: User | null;
  onOpenAdminPortal: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  plants,
  isLoadingPlants,
  currentUser,
  onOpenAdminPortal,
}) => {
  // Modal states
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [is3DStudioOpen, setIs3DStudioOpen] = useState(false);
  const [isGeminiAIOpen, setIsGeminiAIOpen] = useState(false);
  const [geminiAITab, setGeminiAITab] = useState<'chat' | 'maps' | 'video'>('chat');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  // Customer Catalog Search & Category Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Customer Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maruthi_nursery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (plant: Plant, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.plant.id === plant.id);
      const updated = existing
        ? prev.map((i) => (i.plant.id === plant.id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { plant, quantity }];
      try {
        localStorage.setItem('maruthi_nursery_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Added ${plant.name} (x${quantity}) to your nursery cart!`);
  };

  const handleUpdateQuantity = (plantId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(plantId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((i) => (i.plant.id === plantId ? { ...i, quantity } : i));
      try {
        localStorage.setItem('maruthi_nursery_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveItem = (plantId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.plant.id !== plantId);
      try {
        localStorage.setItem('maruthi_nursery_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('maruthi_nursery_cart');
    } catch {}
  };

  // Scroll helpers
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLocation = () => {
    const el = document.getElementById('location-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('enquiry-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const openGeminiWithTab = (tab: 'chat' | 'maps' | 'video' = 'chat') => {
    setGeminiAITab(tab);
    setIsGeminiAIOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 z-50 bg-stone-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-stone-700"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={onOpenAdminPortal}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpen3DStudio={() => setIs3DStudioOpen(true)}
        onOpenGeminiAI={openGeminiWithTab}
        onNavigateToCatalog={scrollToCatalog}
        onNavigateToLocation={scrollToLocation}
        onNavigateToContact={scrollToContact}
        isAdminLoggedIn={currentUser?.email?.toLowerCase() === 'rockstarpurna80@gmail.com'}
        adminEmail={currentUser?.email}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={() => signOut(auth)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
      />


      <main className="flex-1">
        
        {/* Animated Hero Section */}
        <HeroSection
          onExploreCatalog={scrollToCatalog}
          onViewDirections={scrollToLocation}
          totalPlantsCount={plants.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={setSelectedCategory}
        />

        {/* Plant Category Highlights Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Vegetable Plants Card */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => {
                setSelectedCategory('Vegetable Plants');
                scrollToCatalog();
              }}
              className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-700/80 shadow-xl hover:border-emerald-400 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Kitchen Garden Essential</span>
                </span>
                <h4 className="font-serif font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                  Fresh Vegetable Plants
                </h4>
                <p className="text-xs text-emerald-200/80">
                  Guntur Teja Chilli, Guttu Vankaya, Desi Tomato, Curry Leaf & Munaga drumstick.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-2xl shadow-inner">
                🌶️
              </div>
            </motion.div>

            {/* Fruit Saplings Card */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => {
                setSelectedCategory('Fruit Plants');
                scrollToCatalog();
              }}
              className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-xl hover:border-emerald-500 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Grafted & High Yielding
                </span>
                <h4 className="font-serif font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                  Grafted Fruit Varieties
                </h4>
                <p className="text-xs text-stone-400">
                  Royal Banganapalli Mango, Thai Pink Guava, Balaji Kagzi Lemon & Early Jackfruit.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-2xl">
                🥭
              </div>
            </motion.div>

            {/* Flowering & Indoor Greenery Card */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => {
                setSelectedCategory('Flowering Plants');
                scrollToCatalog();
              }}
              className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-xl hover:border-emerald-500 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Lawn & Home Aesthetics
                </span>
                <h4 className="font-serif font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                  Flowering & Shade Trees
                </h4>
                <p className="text-xs text-stone-400">
                  Gundumalle Jasmine, Hybrid Hibiscus, NASA-approved Areca Palms & Avenue Neem.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-stone-800 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-2xl">
                🌸
              </div>
            </motion.div>

          </div>
        </section>

        {/* Catalog Section with Filters & Search */}
        <CatalogSection
          plants={plants}
          onSelectPlant={(plant) => setSelectedPlant(plant)}
          onAddToCart={(plant) => handleAddToCart(plant, 1)}
          cartItems={cartItems}
          isLoading={isLoadingPlants}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Nursery Location & Driving Directions */}
        <LocationSection />

        {/* Customer Enquiry & Bulk Supply Form */}
        <EnquirySection />

      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={onOpenAdminPortal}
        onNavigateToCatalog={scrollToCatalog}
        onNavigateToLocation={scrollToLocation}
        onNavigateToContact={scrollToContact}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp />

      {/* Modals & Drawers */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onAddToCart={(plant, qty) => {
          handleAddToCart(plant, qty);
          setSelectedPlant(null);
        }}
        isInCart={selectedPlant ? cartItems.some((i) => i.plant.id === selectedPlant.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <PlantAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />

      <PlantStudio3D
        isOpen={is3DStudioOpen}
        onClose={() => setIs3DStudioOpen(false)}
        initialPlantName="Banganapalli Grafted Mango"
      />

      <GeminiAssistantModal
        isOpen={isGeminiAIOpen}
        onClose={() => setIsGeminiAIOpen(false)}
        initialTab={geminiAITab}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => showToast('Signed in successfully!')}
      />

    </div>
  );
};

