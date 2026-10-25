import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Heart,
  Navigation
} from 'lucide-react';
import { NURSERY_NAME, NURSERY_PHONE, NURSERY_LOCATION, getGeneralWhatsAppUrl } from '../utils/whatsapp';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToLocation: () => void;
  onNavigateToContact: () => void;
  onOpenAdvisor: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onNavigateToCatalog,
  onNavigateToLocation,
  onNavigateToContact,
  onOpenAdvisor,
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1 & 2: Branding & Location */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                  {NURSERY_NAME}
                </span>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                  Malladi • Amaravathi Road
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              Your trusted botanical destination for grafted fruit trees, ornamental blooms, avenue trees, and indoor greenery. Growing healthy, acclimatized rootstocks for Guntur, Amaravathi, and Andhra Pradesh homes and orchards.
            </p>

            <div className="space-y-2 pt-2 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{NURSERY_LOCATION}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:+${NURSERY_PHONE}`} className="hover:text-white font-semibold">
                  +91 9515369395
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visiting Hours: 7:00 AM – 6:30 PM (All 7 Days)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Plant Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Plant Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Grafted Fruit Varieties (Mango, Guava, Lime)
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Fragrant Flowering & Pooja Shrubs
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Indoor & NASA Air Purifying Palms
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Avenue & Farm Boundary Shade Trees
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Ayurvedic & Medicinal Herbs
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Bonsai & Exotic Caudex Plants
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={onNavigateToCatalog} className="hover:text-emerald-400 transition-colors">
                  Browse Catalog & Prices
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLocation} className="hover:text-emerald-400 transition-colors">
                  Google Maps Directions (Malladi)
                </button>
              </li>
              <li>
                <button onClick={onNavigateToContact} className="hover:text-emerald-400 transition-colors">
                  Bulk Supply Quotation
                </button>
              </li>
              <li>
                <button onClick={onOpenAdvisor} className="hover:text-emerald-400 transition-colors">
                  Plant & Soil Care Advisor
                </button>
              </li>
              <li>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=Malladi+Village+Amaravathi+Road+Guntur+District+Andhra+Pradesh`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get Driving Route</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Direct WhatsApp & Admin */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Direct Contact
            </h4>
            <p className="text-xs text-stone-400">
              Have questions about saplings or ready to place an order?
            </p>

            <a
              href={getGeneralWhatsAppUrl('Catalog Inquiry')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp +91 9515369395</span>
            </a>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Inventory Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Maruthi Nursery. Malladi Village, Amaravathi Road, Guntur District, Andhra Pradesh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500/80">WhatsApp: +91 9515369395</span>
            <span>•</span>
            <button onClick={onOpenAdmin} className="hover:text-stone-300">
              Staff Sign In
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
