import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  HelpCircle,
  Sprout
} from 'lucide-react';
import { submitCustomerEnquiry } from '../services/nurseryService';
import { NURSERY_PHONE, getGeneralWhatsAppUrl } from '../utils/whatsapp';

export const EnquirySection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plantInterest, setPlantInterest] = useState('Wholesale Fruit Orchard Saplings');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, contact phone, and message.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCustomerEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        plantInterest,
        message: message.trim(),
      });

      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setErrorMessage('Could not record your enquiry. Please use direct WhatsApp for immediate reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="enquiry-section" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl overflow-hidden relative">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column: Context & Support */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-800 border border-emerald-600/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sprout className="w-3.5 h-3.5" />
                <span>Bulk Supply & Enquiries</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Plan Your Farm or Garden with Maruthi Nursery
              </h2>

              <p className="text-emerald-100/90 text-sm leading-relaxed">
                Whether you need 100+ grafted Banganapalli mango saplings for your agricultural orchard, avenue trees for your perimeter boundary, or landscape plants for your home in Guntur or Amaravathi, we offer farm-direct wholesale pricing.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-emerald-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Custom bulk quotation within 1 hour on WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Doorstep delivery & transport arrangements across AP</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Free planting, pit preparation & fertilizer consultancy</span>
                </div>
              </div>

              {/* Quick WhatsApp Action button */}
              <div className="pt-4">
                <a
                  href={getGeneralWhatsAppUrl('Bulk Farm Sapling Inquiry')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Nursery Owner on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Contact & Enquiry Form */}
            <div className="lg:col-span-7 bg-white text-stone-900 rounded-2xl p-6 sm:p-8 shadow-2xl">
              
              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-stone-950">
                  Send an Enquiry to Nursery Desk
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Our team at Malladi Village will get back to you promptly.
                </p>
              </div>

              {success ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-stone-900 font-serif text-lg">
                    Enquiry Received!
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Thank you. We have saved your enquiry in our nursery system. You can also message us directly on WhatsApp (+91 9515369395) for an instant response.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. K. Srinivas Rao"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9515369395"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="srinivas@example.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Plant / Supply Interest
                      </label>
                      <select
                        value={plantInterest}
                        onChange={(e) => setPlantInterest(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="Wholesale Fruit Orchard Saplings">Wholesale Fruit Orchard (Mango, Guava, Lime)</option>
                        <option value="Farm Boundary Avenue & Shade Trees">Farm Boundary & Avenue Trees (Neem, Teak, Foxtail)</option>
                        <option value="Flowering & Pooja Plants">Flowering & Pooja Plants (Jasmine, Hibiscus, Plumeria)</option>
                        <option value="Indoor & Office Air Purifiers">Indoor & Office Air Purifiers (Areca, Snake Plant)</option>
                        <option value="Bonsai & Exotic Flora">Bonsai & Exotic Flora</option>
                        <option value="Terrace Garden Setup">Terrace Garden Setup & Soil Mix</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Message / Quantity Needed *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify estimated quantity, delivery location in Guntur/Amaravathi, or specific variety questions..."
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Enquiry to Firestore'}</span>
                  </button>

                  <p className="text-[11px] text-center text-stone-400">
                    Your details are securely saved in our database. We never share your contact number.
                  </p>
                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
