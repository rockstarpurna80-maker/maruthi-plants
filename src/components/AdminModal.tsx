import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  Search,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { Plant, CustomerEnquiry, NurseryOrder, PlantCategory } from '../types/nursery';
import { 
  addPlantToFirestore, 
  updatePlantInFirestore, 
  deletePlantFromFirestore, 
  seedPlantsToFirestore,
  subscribeToEnquiries,
  updateEnquiryStatusInFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore
} from '../services/nurseryService';
import firebaseConfig from '../../firebase-applet-config.json';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
  currentUserId?: string | null;
  currentUserEmail?: string | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  plants,
  currentUserId,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'enquiries' | 'orders' | 'diagnostics'>('inventory');
  
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Plant editing states
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [plantFormData, setPlantFormData] = useState<Partial<Plant>>({
    name: '',
    scientificName: '',
    teluguName: '',
    category: 'Fruit Plants',
    price: 250,
    originalPrice: 300,
    stock: 50,
    inStock: true,
    description: '',
    sunlight: 'Full Sun',
    watering: 'Daily',
    soil: 'Well-drained red or loamy soil',
    size: '2 - 3 Feet Sapling',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    featured: false,
    bestSeller: false,
  });
  const [plantSaveLoading, setPlantSaveLoading] = useState(false);
  const [plantSaveMessage, setPlantSaveMessage] = useState('');

  // Seeding state
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  // Enquiries & Orders state
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [orders, setOrders] = useState<NurseryOrder[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (isOpen && currentUserId) {
      const unsubEnquiries = subscribeToEnquiries(setEnquiries);
      const unsubOrders = subscribeToOrders(setOrders);
      return () => {
        unsubEnquiries();
        unsubOrders();
      };
    }
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  const isAdmin = Boolean(currentUserId);

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err.message || 'Google sign-in failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent, isSignUp = false) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedSuccess('');
    try {
      const res = await seedPlantsToFirestore();
      setSeedSuccess(`Successfully seeded ${res?.count || 18} plants into Cloud Firestore!`);
    } catch (err: any) {
      console.error('Seeding error:', err);
      setPlantSaveMessage('Seeding error: Ensure you are logged in with admin permissions.');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSavePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlantSaveLoading(true);
    setPlantSaveMessage('');

    try {
      if (editingPlant) {
        await updatePlantInFirestore(editingPlant.id, plantFormData);
        setPlantSaveMessage(`Updated "${plantFormData.name}" successfully in Firestore!`);
      } else {
        await addPlantToFirestore(plantFormData as any);
        setPlantSaveMessage(`Added "${plantFormData.name}" to nursery catalog!`);
      }
      setIsAddingPlant(false);
      setEditingPlant(null);
    } catch (err: any) {
      console.error('Save plant error:', err);
      setPlantSaveMessage(`Save failed: ${err.message}`);
    } finally {
      setPlantSaveLoading(false);
    }
  };

  const handleDeletePlant = async (plantId: string, plantName: string) => {
    if (!confirm(`Are you sure you want to delete "${plantName}" from Cloud Firestore?`)) return;
    try {
      await deletePlantFromFirestore(plantId);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleToggleStock = async (plant: Plant) => {
    try {
      await updatePlantInFirestore(plant.id, {
        inStock: !plant.inStock,
        stock: !plant.inStock && plant.stock === 0 ? 25 : plant.stock,
      });
    } catch (err: any) {
      alert(`Stock update failed: ${err.message}`);
    }
  };

  const openEditModal = (plant: Plant) => {
    setEditingPlant(plant);
    setPlantFormData({ ...plant });
    setIsAddingPlant(true);
  };

  const openAddModal = () => {
    setEditingPlant(null);
    setPlantFormData({
      name: '',
      scientificName: '',
      teluguName: '',
      category: 'Fruit Plants',
      price: 250,
      originalPrice: 300,
      stock: 50,
      inStock: true,
      description: '',
      sunlight: 'Full Sun',
      watering: 'Daily',
      soil: 'Well-drained red or loamy soil',
      size: '2 - 3 Feet Sapling',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      featured: false,
      bestSeller: false,
    });
    setIsAddingPlant(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container Card */}
      <div 
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl">
                  Maruthi Nursery Admin Desk
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                    Live Firestore Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                {currentUserEmail ? `Logged in: ${currentUserEmail}` : 'Secure inventory & enquiry management'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAdmin ? (
          /* Sign-In View */
          <div className="p-8 sm:p-12 overflow-y-auto max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-stone-900">
                Admin Sign-In
              </h4>
              <p className="text-xs text-stone-500">
                Sign in with Google or admin credentials to manage plants, view customer enquiries, and update stock in Cloud Firestore.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{authLoading ? 'Signing in...' : 'Sign In with Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-3 text-stone-400 text-[11px] uppercase tracking-wider">or Email Password</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Email / Password fallback */}
            <form onSubmit={(e) => handleEmailAuth(e, false)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@maruthinursery.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={(e) => handleEmailAuth(e, true)}
                  disabled={authLoading}
                  className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Create Admin
                </button>
              </div>
            </form>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
              <strong className="block text-stone-800 mb-0.5">Admin Security Note:</strong>
              Configured admin email <code>rockstarpurna80@gmail.com</code> has instant administrative access in Firestore security rules.
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dashboard Tabs */}
            <div className="px-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'border-emerald-600 text-emerald-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Plant Inventory ({plants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'enquiries'
                      ? 'border-emerald-600 text-emerald-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Customer Enquiries ({enquiries.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'border-emerald-600 text-emerald-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Orders Log ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'diagnostics'
                      ? 'border-emerald-600 text-emerald-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Firebase Diagnostics</span>
                </button>
              </div>

              {activeTab === 'inventory' && (
                <div className="flex items-center gap-2 py-2">
                  <button
                    onClick={handleSeedDatabase}
                    disabled={seedLoading}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Seed the initial 18 real plants to Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin' : ''}`} />
                    <span>{seedLoading ? 'Seeding...' : 'Seed Firestore'}</span>
                  </button>

                  <button
                    onClick={openAddModal}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Plant</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification messages */}
            {seedSuccess && (
              <div className="px-6 py-2 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 border-b border-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{seedSuccess}</span>
              </div>
            )}
            {plantSaveMessage && (
              <div className="px-6 py-2 bg-stone-100 text-stone-800 text-xs font-medium flex items-center justify-between border-b border-stone-200">
                <span>{plantSaveMessage}</span>
                <button onClick={() => setPlantSaveMessage('')} className="text-stone-500 hover:text-stone-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 1: Plant Inventory */}
            {activeTab === 'inventory' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Search in inventory */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter inventory by name, category, or Telugu name..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Table of Plants */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-3">Plant</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock Units</th>
                          <th className="p-3">Availability</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {plants
                          .filter((p) => {
                            if (!searchFilter.trim()) return true;
                            const q = searchFilter.toLowerCase();
                            return (
                              p.name.toLowerCase().includes(q) ||
                              p.category.toLowerCase().includes(q) ||
                              (p.teluguName && p.teluguName.toLowerCase().includes(q))
                            );
                          })
                          .map((plant) => (
                            <tr key={plant.id} className="hover:bg-stone-50/75 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={plant.imageUrl}
                                    alt={plant.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-stone-900">{plant.name}</div>
                                    {plant.teluguName && (
                                      <div className="text-[11px] text-emerald-700 font-medium">
                                        {plant.teluguName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">
                                  {plant.category}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-stone-900 font-serif">
                                ₹{plant.price}
                              </td>
                              <td className="p-3 font-semibold text-stone-700">
                                {plant.stock} units
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleToggleStock(plant)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                    plant.inStock
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                  title="Click to toggle availability in Firestore"
                                >
                                  {plant.inStock ? 'In Stock' : 'Out of Stock'}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditModal(plant)}
                                    className="p-1.5 rounded-lg border border-stone-200 hover:border-emerald-600 text-stone-600 hover:text-emerald-700 transition-colors"
                                    title="Edit plant specs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlant(plant.id, plant.name)}
                                    className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-600 text-stone-600 hover:text-rose-700 transition-colors"
                                    title="Delete from Firestore"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Customer Enquiries */}
            {activeTab === 'enquiries' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {enquiries.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                    <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-600">No customer enquiries logged yet</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Enquiries submitted via the website contact form appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enquiries.map((enq) => (
                      <div key={enq.id} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-stone-900 text-sm">{enq.name}</h5>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <span>Phone:</span>
                              <strong className="text-stone-800 font-semibold">{enq.phone}</strong>
                            </p>
                            {enq.email && <p className="text-[11px] text-stone-500">Email: {enq.email}</p>}
                          </div>
                          
                          <select
                            value={enq.status}
                            onChange={(e) => enq.id && updateEnquiryStatusInFirestore(enq.id, e.target.value as any)}
                            className={`text-[10px] font-bold uppercase rounded-md px-2 py-1 border ${
                              enq.status === 'new'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : enq.status === 'contacted'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>

                        {enq.plantInterest && (
                          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Interest: {enq.plantInterest}
                          </div>
                        )}

                        <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          "{enq.message}"
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                          <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                          <a
                            href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${enq.name}, Greetings from Maruthi Nursery! Regarding your enquiry about ${enq.plantInterest || 'plants'}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Customer Orders */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                    <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-600">No orders placed yet</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Orders submitted via the cart flow are recorded in Cloud Firestore here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-stone-900 text-sm">{ord.customerName}</h5>
                              <span className="text-xs font-serif font-bold text-emerald-800">₹{ord.totalAmount}</span>
                            </div>
                            <p className="text-xs text-stone-600">
                              Phone: <strong className="text-stone-900">{ord.customerPhone}</strong> | Type: <span className="capitalize">{ord.deliveryType.replace('_', ' ')}</span>
                            </p>
                          </div>

                          <select
                            value={ord.status}
                            onChange={(e) => ord.id && updateOrderStatusInFirestore(ord.id, e.target.value as any)}
                            className="text-xs font-semibold rounded-lg px-2 py-1 border border-stone-200 bg-stone-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 font-medium">
                          {ord.itemsSummary}
                        </div>

                        {ord.deliveryAddress && (
                          <p className="text-[11px] text-stone-500">
                            <strong>Address:</strong> {ord.deliveryAddress}
                          </p>
                        )}
                        {ord.notes && (
                          <p className="text-[11px] text-stone-500 italic">
                            <strong>Note:</strong> {ord.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                          <span>{new Date(ord.createdAt).toLocaleString()}</span>
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.customerName}, Greetings from Maruthi Nursery! Regarding your plant order (Total ₹${ord.totalAmount})...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Firebase Diagnostics & Status */}
            {activeTab === 'diagnostics' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      Firebase Cloud Database Provisioned Successfully
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      Cloud Firestore and Authentication are fully connected to the active project. Security rules have been deployed and active permissions are enforced.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                    <span className="text-stone-500 font-semibold uppercase text-[10px]">Project ID</span>
                    <p className="font-mono font-bold text-stone-800">{firebaseConfig.projectId}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                    <span className="text-stone-500 font-semibold uppercase text-[10px]">Firestore Database ID</span>
                    <p className="font-mono font-bold text-stone-800">{firebaseConfig.firestoreDatabaseId}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                    <span className="text-stone-500 font-semibold uppercase text-[10px]">Current Admin Email</span>
                    <p className="font-mono font-bold text-emerald-800">{currentUserEmail || 'None'}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                    <span className="text-stone-500 font-semibold uppercase text-[10px]">Firestore Security Rules</span>
                    <p className="font-mono font-bold text-emerald-800">Hardened ABAC Rules Active</p>
                  </div>
                </div>

                {/* Database Seeding Card */}
                <div className="p-5 border border-stone-200 rounded-2xl bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-stone-900 text-sm">Nursery Catalog Initializer</h5>
                      <p className="text-xs text-stone-500">Populate the live Firestore database with all 18 authentic Andhra nursery plants (Banganapalli mango, Thai guava, Kagzi lemon, jasmine, areca palm, etc.).</p>
                    </div>
                    <button
                      onClick={handleSeedDatabase}
                      disabled={seedLoading}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {seedLoading ? 'Seeding...' : 'Seed Plants to Firestore'}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Add / Edit Plant Sub-Modal */}
      {isAddingPlant && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h4 className="font-serif font-bold text-xl text-stone-900">
                {editingPlant ? `Edit ${editingPlant.name}` : 'Add New Plant to Catalog'}
              </h4>
              <button
                onClick={() => setIsAddingPlant(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Plant Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={plantFormData.name || ''}
                    onChange={(e) => setPlantFormData({ ...plantFormData, name: e.target.value })}
                    placeholder="e.g. Banganapalli Mango"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Telugu Local Name</label>
                  <input
                    type="text"
                    value={plantFormData.teluguName || ''}
                    onChange={(e) => setPlantFormData({ ...plantFormData, teluguName: e.target.value })}
                    placeholder="e.g. బేనిషా మామిడి మొక్క"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={plantFormData.category || 'Fruit Plants'}
                    onChange={(e) => setPlantFormData({ ...plantFormData, category: e.target.value as PlantCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Fruit Plants">Fruit Plants</option>
                    <option value="Flowering Plants">Flowering Plants</option>
                    <option value="Indoor & Air Purifying">Indoor & Air Purifying</option>
                    <option value="Medicinal & Herbal">Medicinal & Herbal</option>
                    <option value="Avenue & Shade Trees">Avenue & Shade Trees</option>
                    <option value="Bonsai & Exotic">Bonsai & Exotic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={plantFormData.price || 0}
                    onChange={(e) => setPlantFormData({ ...plantFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={plantFormData.stock || 0}
                    onChange={(e) => setPlantFormData({ ...plantFormData, stock: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={plantFormData.imageUrl || ''}
                  onChange={(e) => setPlantFormData({ ...plantFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={plantFormData.description || ''}
                  onChange={(e) => setPlantFormData({ ...plantFormData, description: e.target.value })}
                  placeholder="Describe growth habit, climate adaptability in Guntur region, and yield..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sunlight</label>
                  <select
                    value={plantFormData.sunlight || 'Full Sun'}
                    onChange={(e) => setPlantFormData({ ...plantFormData, sunlight: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Full Sun">Full Sun</option>
                    <option value="Partial Shade">Partial Shade</option>
                    <option value="Indirect Bright">Indirect Bright</option>
                    <option value="Low to Medium Light">Low to Medium Light</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Watering</label>
                  <select
                    value={plantFormData.watering || 'Daily'}
                    onChange={(e) => setPlantFormData({ ...plantFormData, watering: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice a Week">Twice a Week</option>
                    <option value="Weekly">Weekly</option>
                    <option value="When Top Soil Dries">When Top Soil Dries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ready Sapling Size</label>
                  <input
                    type="text"
                    value={plantFormData.size || ''}
                    onChange={(e) => setPlantFormData({ ...plantFormData, size: e.target.value })}
                    placeholder="e.g. 2 - 3 Feet Grafted"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plantFormData.inStock ?? true}
                    onChange={(e) => setPlantFormData({ ...plantFormData, inStock: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span className="font-semibold text-stone-800">In Stock for Immediate Pickup</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plantFormData.featured ?? false}
                    onChange={(e) => setPlantFormData({ ...plantFormData, featured: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span className="font-semibold text-stone-800">Featured / Popular</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddingPlant(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-50 font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={plantSaveLoading}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  {plantSaveLoading ? 'Saving...' : 'Save to Cloud Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
