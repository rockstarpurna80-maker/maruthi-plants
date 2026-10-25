import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle, 
  Car, 
  Bus, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';
import { NURSERY_PHONE, NURSERY_LOCATION, getGeneralWhatsAppUrl } from '../utils/whatsapp';

export const LocationSection: React.FC = () => {
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Malladi+Village+Amaravathi+Road+Guntur+District+Andhra+Pradesh`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=Malladi+Village+Amaravathi+Road+Guntur+Andhra+Pradesh`;

  return (
    <section id="location-section" className="py-16 bg-stone-100 border-t border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visit Our Nursery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Nursery Location & Driving Directions
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Located right on Amaravathi Road at Malladi Village. Come hand-pick your favorite saplings and get direct consultation from our horticultural experts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Business & Visiting Details */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              {/* Address Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Nursery Address
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-950">
                  Maruthi Nursery
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed font-medium">
                  {NURSERY_LOCATION}
                </p>
                <p className="text-xs text-stone-500">
                  Landmark: On Main Amaravathi Road near Malladi Village Center.
                </p>
              </div>

              {/* Visiting Hours & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs text-stone-900">Timings</strong>
                    <span className="text-xs text-stone-600 block">7:00 AM – 6:30 PM</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Open Every Day</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs text-stone-900">Phone & WhatsApp</strong>
                    <a href={`tel:+${NURSERY_PHONE}`} className="text-xs font-bold text-emerald-800 hover:underline block">
                      +91 9515369395
                    </a>
                    <span className="text-[11px] text-stone-500">Call anytime</span>
                  </div>
                </div>
              </div>

              {/* Transit Distances */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Nearby Access & Travel Times</span>
                </h4>
                <ul className="text-xs text-stone-600 space-y-1.5">
                  <li className="flex items-center justify-between">
                    <span>From Guntur City Center (Lodge / Bus Stand):</span>
                    <strong className="text-stone-800">~15–20 Mins</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>From Amaravathi Heritage Town / AP High Court:</span>
                    <strong className="text-stone-800">~20–25 Mins</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>From Vijayawada (Prakasam Barrage):</span>
                    <strong className="text-stone-800">~45–50 Mins</strong>
                  </li>
                </ul>
              </div>

              {/* Customer Amenities */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free & spacious parking for tractors, cars, and autos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Loading assistance and transport arrangement for bulk orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>On-site plant care and planting soil guidance in Telugu & English</span>
                </div>
              </div>
            </div>

            {/* Direction Action Buttons */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps Directions</span>
              </a>

              <a
                href={getGeneralWhatsAppUrl('Nursery Directions & Visit')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp Live Location</span>
              </a>
            </div>

          </div>

          {/* Right Column: Google Maps Interactive View */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm flex flex-col">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Amaravathi Road, Malladi, Guntur</span>
              </div>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <span>View Full Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative flex-1 min-h-[380px] bg-stone-200">
              {/* Embedded Google Map */}
              <iframe
                title="Maruthi Nursery Malladi Village Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.4!2d80.37!3d16.38!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f0!2sMalladi%2C+Amaravathi+Road%2C+Guntur%2C+Andhra+Pradesh!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 min-h-[380px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="p-4 bg-emerald-900 text-emerald-100 text-xs flex flex-wrap items-center justify-between gap-2">
              <span>Need help finding us? Call directly: <strong>+91 9515369395</strong></span>
              <a 
                href={`tel:+${NURSERY_PHONE}`} 
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold"
              >
                Call Now
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
