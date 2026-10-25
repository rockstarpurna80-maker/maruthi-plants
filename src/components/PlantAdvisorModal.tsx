import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sun, 
  Droplets, 
  Layers, 
  ShieldAlert, 
  Sprout, 
  MessageCircle, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { getGeneralWhatsAppUrl, NURSERY_PHONE } from '../utils/whatsapp';

interface PlantAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AdvisorTopic {
  id: string;
  title: string;
  teluguTitle: string;
  tag: string;
  summary: string;
  steps: string[];
}

const REGIONAL_ADVICE_TOPICS: AdvisorTopic[] = [
  {
    id: 'mango-flowering',
    title: 'How to get maximum flowering & fruit set in Banganapalli Mango?',
    teluguTitle: 'బేనిషా మామిడిలో అధిక దిగుబడి మరియు పూత సంరక్షణ',
    tag: 'Fruit Care',
    summary: 'In Guntur and Amaravathi regions, mango tree blooming occurs between December and February.',
    steps: [
      'Stop excessive watering starting November to induce stress-triggered heavy flower panicles.',
      'Spray neem oil extract (5ml per liter) mixed with mild soap before flower buds open to prevent hopper pests.',
      'Apply organic vermicompost (15-20 kg per mature tree) around the drip line in early monsoon and post-harvest.',
      'Mulch the tree base with dry leaves or paddy straw during hot summer months (March-May) to retain moisture.',
    ],
  },
  {
    id: 'guntur-black-soil',
    title: 'Managing Plant Drainage in Guntur & Amaravathi Black Cotton Soil',
    teluguTitle: 'నల్ల రేగడి నేలల్లో మొక్కల పెంపకం మరియు నీటి పారుదల',
    tag: 'Soil & Planting',
    summary: 'Black cotton soil holds high moisture and expands when wet, contracting and cracking when dry.',
    steps: [
      'Dig planting pits of 3x3x3 feet and leave them open to the sun for 10-15 days to sterilize the soil.',
      'Mix 40% native topsoil with 30% coarse river sand, 20% aged farmyard manure / vermicompost, and 10% red soil.',
      'Always plant grafted saplings on a slightly raised mound (6 inches above ground) to avoid collar rot.',
      'Install drip irrigation or water every 3-4 days rather than daily flooding to prevent root asphyxiation.',
    ],
  },
  {
    id: 'jasmine-fragrance',
    title: 'Boosting Mogra & Gundumalle Jasmine Heavy Flowering',
    teluguTitle: 'గుండుమల్లె మొక్కలో విపరీతమైన మొగ్గలు మరియు పూల కోసం',
    tag: 'Flowering',
    summary: 'Jasmines love full scorching sun (minimum 6 hours daily) and regular seasonal pruning.',
    steps: [
      'Prune woody branches back by one-third in late January to stimulate lush new blooming shoots.',
      'Withhold water for 4-5 days after pruning until leaves start to drop, then resume deep watering.',
      'Feed with bone meal or fermented mustard cake / groundnut cake tea every 15 days.',
      'Keep in unshaded full sunlight on your open terrace or garden for maximum fragrance.',
    ],
  },
  {
    id: 'indoor-air-purifier',
    title: 'Keeping Areca Palm and Snake Plants Lush Green Indoors',
    teluguTitle: 'ఇండోర్ మొక్కల సంరక్షణ - ఎరికా పామ్ మరియు స్నేక్ ప్లాంట్',
    tag: 'Indoor Living',
    summary: 'The #1 reason indoor plants fail is overwatering rather than underwatering.',
    steps: [
      'Check soil moisture: Insert a finger 1 inch into the pot. Water ONLY when dry to the touch.',
      'Place near bright indirect windows or shaded balconies; avoid direct harsh afternoon sun that burns foliage.',
      'Wipe leaf surfaces once a month with a damp cotton cloth to remove dust and maximize air purification.',
      'Ensure the pot has drainage holes so water never sits at the bottom causing root rot.',
    ],
  },
];

export const PlantAdvisorModal: React.FC<PlantAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<AdvisorTopic>(REGIONAL_ADVICE_TOPICS[0]);
  const [customQuestion, setCustomQuestion] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl">
                Maruthi Nursery Plant Care & Soil Advisor
              </h3>
              <p className="text-xs text-emerald-200">
                Tailored for Malladi, Amaravathi & Guntur regional climate and soils
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Topic Pills */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Select Common Regional Gardening Guides
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REGIONAL_ADVICE_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedTopic.id === topic.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {topic.tag}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-stone-900 line-clamp-1">
                    {topic.title}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium line-clamp-1 mt-0.5">
                    {topic.teluguTitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Guide Card */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-stone-900">
                {selectedTopic.title}
              </h4>
              <p className="text-xs font-medium text-emerald-800 mt-0.5">
                {selectedTopic.teluguTitle}
              </p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {selectedTopic.summary}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Recommended Cultivation Protocol:
              </span>
              <ul className="space-y-2 text-xs text-stone-700">
                {selectedTopic.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ask Specific Question on WhatsApp */}
          <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-serif font-bold text-sm">Have a Specific Plant Issue or Disease?</h5>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Send a photo of your leaf or plant to our nursery botanist on WhatsApp for free diagnosis.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. Yellow leaves on lemon plant in Malladi"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-emerald-800/80 border border-emerald-600 text-white placeholder-emerald-300 focus:outline-none"
              />
              <a
                href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent(
                  customQuestion.trim()
                    ? `Hello Maruthi Nursery! Plant Care Question: ${customQuestion.trim()}`
                    : `Hello Maruthi Nursery! I have a question regarding plant care and fertilizer in Guntur.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-850"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
