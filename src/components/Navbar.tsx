import React, { useState } from 'react';
import { 
  Sprout, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Menu, 
  X, 
  ShieldCheck, 
  MessageCircle,
  Sparkles,
  Rotate3d,
  Bot,
  Search,
  User as UserIcon,
  LogOut
} from 'lucide-react';

import { NURSERY_NAME, NURSERY_PHONE, getGeneralWhatsAppUrl } from '../utils/whatsapp';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenAdvisor: () => void;
  onOpen3DStudio: () => void;
  onOpenGeminiAI: (tab?: 'chat' | 'maps' | 'video') => void;
  onNavigateToCatalog: () => void;
  onNavigateToLocation: () => void;
  onNavigateToContact: () => void;
  isAdminLoggedIn: boolean;
  adminEmail?: string | null;
  currentUser?: any | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}


export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenAdvisor,
  onOpen3DStudio,
  onOpenGeminiAI,
  onNavigateToCatalog,
  onNavigateToLocation,
  onNavigateToContact,
  isAdminLoggedIn,
  adminEmail,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  searchQuery = '',
  onSearchChange,
  onSelectCategory,
}) => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Visiting Hours: <strong>7:00 AM – 6:30 PM (All 7 Days)</strong></span>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="hidden md:inline">Malladi Village, Amaravathi Road, Guntur</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={`tel:+${NURSERY_PHONE}`} 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+91 9515369395</span>
            </a>
            <a
              href={getGeneralWhatsAppUrl('Visiting Nursery')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-white flex items-center gap-1 transition-colors font-semibold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">
                  MARUTHI
                </span>
                <span className="text-xs uppercase tracking-widest font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  Nursery
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600 inline" />
                Malladi, Amaravathi Rd, Guntur
              </p>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-stone-700">
            <button
              onClick={() => {
                onSelectCategory?.('All');
                onNavigateToCatalog();
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Plant Catalog
            </button>

            {/* Direct Vegetable Plants Filter Button */}
            <button
              onClick={() => {
                onSelectCategory?.('Vegetable Plants');
                onNavigateToCatalog();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold cursor-pointer shadow-2xs"
            >
              <span>🌶️ Vegetable Plants</span>
            </button>

            {/* Direct Fruit Plants Filter Button */}
            <button
              onClick={() => {
                onSelectCategory?.('Fruit Plants');
                onNavigateToCatalog();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-xl hover:bg-amber-100 transition-all text-xs font-bold cursor-pointer shadow-2xs"
            >
              <span>🥭 Fruit Plants</span>
            </button>

            <button
              onClick={onNavigateToLocation}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Directions & Map
            </button>
            <button
              onClick={onNavigateToContact}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Bulk Orders
            </button>
          </nav>

          {/* Quick Search Bar in Navbar */}
          <div className="hidden xl:flex items-center relative w-52 mr-2">
            <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                onNavigateToCatalog();
              }}
              placeholder="Search plant variety..."
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-white focus:bg-white text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Callout */}
            <a
              href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent('Hello Maruthi Nursery! I would like to order plants and check availability at your Malladi Village location.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Order</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              aria-label="View nursery cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Authentication Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1 pr-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left text-[11px] leading-tight">
                  <span className="font-semibold text-stone-800 truncate max-w-[90px]">
                    {currentUser.displayName?.split(' ')[0] || 'Member'}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium">Logged In</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1 hover:bg-stone-200 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer ml-1"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                title="Customer Login / Sign Up"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>Sign In</span>
              </button>
            )}

            {/* Admin Management Button */}
            <button
              onClick={onOpenAdmin}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                isAdminLoggedIn
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900'
              }`}
              title={isAdminLoggedIn ? `Logged in: ${adminEmail}` : 'Admin Inventory Login'}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdminLoggedIn ? 'text-emerald-700' : 'text-stone-500'}`} />
              <span className="hidden md:inline">
                {isAdminLoggedIn ? 'Admin Panel' : 'Admin'}
              </span>
            </button>


            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-stone-200 text-stone-700"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-emerald-100 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          {/* Mobile Quick Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigateToCatalog();
                  setMobileMenuOpen(false);
                }
              }}
              placeholder="Search plants by variety (e.g. Mango)..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onSelectCategory?.('All');
              onNavigateToCatalog();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-stone-50 text-stone-800 font-medium"
          >
            🌱 All Plants Catalog
          </button>

          <button
            onClick={() => {
              onSelectCategory?.('Vegetable Plants');
              onNavigateToCatalog();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2 border border-emerald-200"
          >
            <span>🌶️ Fresh Vegetable Plants</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory?.('Fruit Plants');
              onNavigateToCatalog();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg bg-amber-50 text-amber-900 font-bold flex items-center gap-2 border border-amber-200"
          >
            <span>🥭 Grafted Fruit Plants</span>
          </button>

          <button
            onClick={() => {
              onNavigateToLocation();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-stone-50 text-stone-800 font-medium"
          >
            📍 Location & Directions (Malladi)
          </button>

          <button
            onClick={() => {
              onNavigateToContact();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-stone-50 text-stone-800 font-medium"
          >
            💬 Bulk Orders & Consultation
          </button>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-800">{currentUser.displayName || 'Member'}</p>
                    <p className="text-[10px] text-stone-500">{currentUser.email}</p>
                  </div>
                </div>
                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 font-medium px-2 py-1 rounded bg-rose-50"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-center font-semibold text-xs flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Customer Sign In / Sign Up</span>
              </button>
            )}

            <a
              href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent('Hello Maruthi Nursery, Malladi! I want to order plants.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp +91 9515369395</span>
            </a>
          </div>

        </div>
      )}
    </header>
  );
};
