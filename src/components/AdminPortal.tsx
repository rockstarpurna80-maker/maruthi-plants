import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertOctagon, 
  LogOut, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Database, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  Search, 
  ExternalLink,
  MessageCircle,
  Key,
  X,
  TrendingUp,
  AlertTriangle,
  Store,
  Users,
  Image as ImageIcon,
  Upload,
  Camera,
  Sparkles,
  Eye,
  Check,
  Copy,
  CheckCheck,
  Clock,
  FileText,
  Smartphone,
  Globe,
  Sprout,
  Sun,
  Droplets,
  Layers,
  Scissors
} from 'lucide-react';
import { 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  Plant, 
  CustomerEnquiry, 
  NurseryOrder, 
  PlantCategory, 
  AdminLoginRecord,
  UploadedPhoto,
  UserProfile,
  UserSessionLog 
} from '../types/nursery';
import { 
  addPlantToFirestore, 
  updatePlantInFirestore, 
  deletePlantFromFirestore, 
  seedPlantsToFirestore,
  subscribeToEnquiries,
  updateEnquiryStatusInFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  logAdminLoginAttempt,
  subscribeToAdminLogins,
  subscribeToMediaGallery,
  addPhotoToGallery,
  deletePhotoFromGallery,
  replacePhotoInGallery,
  subscribeToUsers,
  subscribeToUserSessions,
  recordUserLogin,
  logUserSession
} from '../services/nurseryService';

import firebaseConfig from '../../firebase-applet-config.json';

// Designated Authorized Single Main Admin Email
const DESIGNATED_MAIN_ADMIN_EMAIL = 'rockstarpurna80@gmail.com';

// Master Nursery Security Passcode ("Some condition" required for administrative unlock)
const MASTER_SECURITY_PASSCODE = '9515';

// Curated Plant Photography Presets for 1-Click Selection
const PRESET_PLANT_IMAGES = [
  {
    name: 'Guntur Teja Chilli',
    category: 'Vegetable',
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Guttu Vankaya (Brinjal)',
    category: 'Vegetable',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Desi Cluster Tomato',
    category: 'Vegetable',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Karivepaku Curry Leaf',
    category: 'Vegetable',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Banganapalli Mango',
    category: 'Fruit',
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Thai Pink Guava',
    category: 'Fruit',
    url: 'https://images.unsplash.com/photo-1536511135899-73e481b0a2c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Balaji Kagzi Lemon',
    category: 'Fruit',
    url: 'https://images.unsplash.com/photo-1587496679742-bad502958fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Jackfruit Sapling',
    category: 'Fruit',
    url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mogra Jasmine',
    category: 'Flowering',
    url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hybrid Hibiscus',
    category: 'Flowering',
    url: 'https://images.unsplash.com/photo-1588628566587-dbd176de94b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Red Plumeria / Champa',
    category: 'Flowering',
    url: 'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bougainvillea Bush',
    category: 'Flowering',
    url: 'https://images.unsplash.com/photo-1599598425947-5202edd56247?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Areca Palm',
    category: 'Indoor',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Snake Plant Laurentii',
    category: 'Indoor',
    url: 'https://images.unsplash.com/photo-1599818816933-4f938d613911?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'ZZ Fortune Plant',
    category: 'Indoor',
    url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fiddle Leaf Fig',
    category: 'Indoor',
    url: 'https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Krishna Holy Basil',
    category: 'Medicinal',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Barbadensis Giant Aloe',
    category: 'Medicinal',
    url: 'https://images.unsplash.com/photo-1596547609652-9cf5d0d76676?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Indian Neem Sapling',
    category: 'Avenue',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Adenium Bonsai',
    category: 'Exotic',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  },
];

interface AdminPortalProps {
  onReturnToCustomerPortal: () => void;
  plants: Plant[];
  currentUser: User | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onReturnToCustomerPortal,
  plants,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'gallery' | 'orders' | 'enquiries' | 'logins' | 'security'>('overview');

  // Security Gate States
  const [securityPasscode, setSecurityPasscode] = useState('');
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Email / Password form
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Plant CRUD States
  const [searchFilter, setSearchFilter] = useState('');
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload' | 'presets'>('presets');
  
  // Image file upload & client-side compression states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    originalSize: string;
    optimizedSize: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dedicated Photo Gallery Manager States
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<number>(0);
  const [isUploadingToGallery, setIsUploadingToGallery] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const [galleryNewPhotoPreview, setGalleryNewPhotoPreview] = useState<{
    dataUrl: string;
    name: string;
    originalSize: string;
    optimizedSize: string;
    dimensions: string;
  } | null>(null);
  const [galleryPhotoCategory, setGalleryPhotoCategory] = useState<string>('Fruit Plants');
  const [galleryPhotoName, setGalleryPhotoName] = useState<string>('');
  const [previewModalPhoto, setPreviewModalPhoto] = useState<UploadedPhoto | null>(null);
  const [replacingTargetPhoto, setReplacingTargetPhoto] = useState<UploadedPhoto | null>(null);
  const [galleryFilterCategory, setGalleryFilterCategory] = useState<string>('All');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [galleryCopySuccess, setGalleryCopySuccess] = useState<string | null>(null);

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
    careTips: {
      wateringFrequency: '',
      sunlightNeeds: '',
      soilPreference: '',
      fertilizerSchedule: '',
      pruningTips: '',
      seasonalCare: '',
      growthNotes: '',
    },
  });
  const [plantSaveLoading, setPlantSaveLoading] = useState(false);
  const [plantNotification, setPlantNotification] = useState('');

  // Seeding state
  const [seedLoading, setSeedLoading] = useState(false);

  // Subscribed Firestore data
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [orders, setOrders] = useState<NurseryOrder[]>([]);
  const [loginAuditLogs, setLoginAuditLogs] = useState<AdminLoginRecord[]>([]);
  const [mediaPhotos, setMediaPhotos] = useState<UploadedPhoto[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [userSessions, setUserSessions] = useState<UserSessionLog[]>([]);

  // Strict Condition Verification
  const isEmailAuthorized = currentUser?.email?.toLowerCase() === DESIGNATED_MAIN_ADMIN_EMAIL.toLowerCase();
  const isFullyAuthorized = Boolean(currentUser) && isEmailAuthorized && isPasscodeUnlocked;

  // Auto-enforce single-member policy: If someone logs in with any other email, block and logout
  useEffect(() => {
    if (currentUser && currentUser.email && currentUser.email.toLowerCase() !== DESIGNATED_MAIN_ADMIN_EMAIL.toLowerCase()) {
      const blockedEmail = currentUser.email;
      logAdminLoginAttempt({
        email: blockedEmail,
        userId: currentUser.uid,
        status: 'denied_unauthorized_email',
        userAgent: navigator.userAgent,
      }).catch(() => {});

      setAuthError(
        `ACCESS DENIED: Strict Single-Member Policy Enforced. Account "${blockedEmail}" is not authorized. Only designated Main Admin (${DESIGNATED_MAIN_ADMIN_EMAIL}) may log into the Maruthi Nursery management portal.`
      );
      signOut(auth).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (isFullyAuthorized) {
      const unsubEnquiries = subscribeToEnquiries(setEnquiries);
      const unsubOrders = subscribeToOrders(setOrders);
      const unsubLogins = subscribeToAdminLogins(setLoginAuditLogs);
      const unsubGallery = subscribeToMediaGallery(setMediaPhotos);
      const unsubUsers = subscribeToUsers(setRegisteredUsers);
      const unsubSessions = subscribeToUserSessions(setUserSessions);
      return () => {
        unsubEnquiries();
        unsubOrders();
        unsubLogins();
        unsubGallery();
        unsubUsers();
        unsubSessions();
      };
    }
  }, [isFullyAuthorized]);


  // Handle Google Login
  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== DESIGNATED_MAIN_ADMIN_EMAIL.toLowerCase()) {
        await logAdminLoginAttempt({
          email: result.user.email || 'unknown',
          userId: result.user.uid,
          status: 'denied_unauthorized_email',
          userAgent: navigator.userAgent,
        });
        await signOut(auth);
        setAuthError(
          `ACCESS DENIED: Account "${result.user.email}" is not the authorized main admin. Only ${DESIGNATED_MAIN_ADMIN_EMAIL} can access.`
        );
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Email Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (adminEmailInput.toLowerCase() !== DESIGNATED_MAIN_ADMIN_EMAIL.toLowerCase()) {
      setAuthError(`Only the primary admin email (${DESIGNATED_MAIN_ADMIN_EMAIL}) is permitted.`);
      setAuthLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, adminEmailInput, adminPasswordInput);
    } catch (err: any) {
      console.error('Email login error:', err);
      setAuthError(err.message || 'Invalid admin credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify Master Passcode (Condition Gate)
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPasscode.trim() === MASTER_SECURITY_PASSCODE || securityPasscode.trim() === 'Maruthi@9515') {
      setIsPasscodeUnlocked(true);
      setAuthError('');
      // Record successful authorized login in Firestore audit trail
      if (currentUser) {
        logAdminLoginAttempt({
          email: currentUser.email || DESIGNATED_MAIN_ADMIN_EMAIL,
          userId: currentUser.uid,
          status: 'authorized',
          userAgent: navigator.userAgent,
        }).catch(() => {});
      }
    } else {
      if (currentUser) {
        logAdminLoginAttempt({
          email: currentUser.email || 'unknown',
          userId: currentUser.uid,
          status: 'denied_passcode',
          userAgent: navigator.userAgent,
        }).catch(() => {});
      }
      setAuthError('Invalid Master Security Passcode PIN. Please enter the nursery admin code (9515).');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsPasscodeUnlocked(false);
    setSecurityPasscode('');
  };

  // Inventory Handlers
  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    try {
      const res = await seedPlantsToFirestore();
      setPlantNotification(`Catalog successfully seeded with ${res?.count || 18} plants!`);
    } catch (err: any) {
      alert(`Seeding error: ${err.message}`);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSavePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingFile) {
      alert('Photo is still being compressed and optimized. Please wait a few seconds.');
      return;
    }

    if (!plantFormData.imageUrl || !plantFormData.imageUrl.trim()) {
      alert('Please provide a plant photo (select from Nursery Presets, Paste URL, or Upload a photo).');
      return;
    }

    setPlantSaveLoading(true);
    setPlantNotification('');

    try {
      if (editingPlant) {
        await updatePlantInFirestore(editingPlant.id, plantFormData);
        setPlantNotification(`Updated "${plantFormData.name}" successfully in Cloud Firestore!`);
      } else {
        await addPlantToFirestore(plantFormData as any);
        setPlantNotification(`Added "${plantFormData.name}" to nursery catalog!`);
      }
      setIsAddingPlant(false);
      setEditingPlant(null);
      setUploadedFileInfo(null);
      setFileUploadError('');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setPlantSaveLoading(false);
    }
  };

  const handleDeletePlant = async (plantId: string, plantName: string) => {
    if (!confirm(`Delete "${plantName}" permanently from Cloud Firestore?`)) return;
    try {
      await deletePlantFromFirestore(plantId);
      setPlantNotification(`Deleted "${plantName}" from catalog.`);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleToggleStock = async (plant: Plant) => {
    try {
      await updatePlantInFirestore(plant.id, {
        inStock: !plant.inStock,
        stock: !plant.inStock && plant.stock === 0 ? 30 : plant.stock,
      });
    } catch (err: any) {
      alert(`Stock update failed: ${err.message}`);
    }
  };

  const openAddPlant = () => {
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
      careTips: {
        wateringFrequency: '',
        sunlightNeeds: '',
        soilPreference: '',
        fertilizerSchedule: '',
        pruningTips: '',
        seasonalCare: '',
        growthNotes: '',
      },
    });
    setImageInputMode('presets');
    setIsAddingPlant(true);
  };

  const openEditPlant = (plant: Plant) => {
    setEditingPlant(plant);
    setPlantFormData({
      ...plant,
      careTips: plant.careTips ? { ...plant.careTips } : {
        wateringFrequency: '',
        sunlightNeeds: '',
        soilPreference: '',
        fertilizerSchedule: '',
        pruningTips: '',
        seasonalCare: '',
        growthNotes: '',
      },
    });
    setImageInputMode('url');
    setIsAddingPlant(true);
  };

  // High-performance client-side image compression & format optimization
  // Compresses high-res camera photos down to lightweight HD web-ready JPEG (~80-150KB)
  // preventing Firestore 1MB document limit exhaustion and ensuring instant loading!
  const processAndOptimizeImage = async (
    file: File
  ): Promise<{ dataUrl: string; originalSize: string; optimizedSize: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file (JPG, PNG, or WebP).'));
        return;
      }

      const origBytes = file.size;
      const originalSizeKb = Math.round(origBytes / 1024);
      const originalSizeStr = originalSizeKb > 1024
        ? `${(originalSizeKb / 1024).toFixed(1)} MB`
        : `${originalSizeKb} KB`;

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the selected image file.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to decode image data. Please choose a standard JPG or PNG photo.'));
        img.onload = () => {
          // Standard e-commerce catalog max dimension: 900px
          const MAX_DIM = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to reader result if canvas 2D context is unavailable
            resolve({
              dataUrl: e.target?.result as string,
              originalSize: originalSizeStr,
              optimizedSize: originalSizeStr,
            });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to Web-friendly JPEG format (quality 0.82)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const base64Len = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
          const approxBytes = Math.round(base64Len * 0.75);
          const optSizeKb = Math.round(approxBytes / 1024);
          const optimizedSizeStr = optSizeKb > 1024
            ? `${(optSizeKb / 1024).toFixed(1)} MB`
            : `${optSizeKb} KB`;

          resolve({
            dataUrl: compressedDataUrl,
            originalSize: originalSizeStr,
            optimizedSize: optimizedSizeStr,
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileSelect = async (file: File) => {
    if (!file) return;
    setFileUploadError('');
    setIsProcessingFile(true);
    try {
      const result = await processAndOptimizeImage(file);
      setPlantFormData((prev) => ({
        ...prev,
        imageUrl: result.dataUrl,
      }));
      setUploadedFileInfo({
        name: file.name,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
      });
    } catch (err: any) {
      console.error('File optimization error:', err);
      setFileUploadError(err.message || 'Error processing selected photo. Please try another image.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Photo Gallery Handlers
  const handleSelectGalleryFile = async (file: File) => {
    if (!file) return;
    setFileUploadError('');
    setIsProcessingFile(true);
    try {
      const result = await processAndOptimizeImage(file);
      setGalleryNewPhotoPreview({
        dataUrl: result.dataUrl,
        name: file.name,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        dimensions: '900 x 600',
      });
      setGalleryPhotoName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    } catch (err: any) {
      console.error('Gallery file optimization error:', err);
      setFileUploadError(err.message || 'Error processing selected photo.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleConfirmGalleryUpload = async () => {
    if (!galleryNewPhotoPreview) return;
    setIsUploadingToGallery(true);
    setGalleryUploadProgress(15);

    // Smooth upload progress bar animation
    const progressInterval = setInterval(() => {
      setGalleryUploadProgress((prev) => {
        if (prev >= 88) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    try {
      if (replacingTargetPhoto) {
        await replacePhotoInGallery(replacingTargetPhoto.id, {
          name: galleryPhotoName.trim() || galleryNewPhotoPreview.name,
          dataUrl: galleryNewPhotoPreview.dataUrl,
          originalSize: galleryNewPhotoPreview.originalSize,
          optimizedSize: galleryNewPhotoPreview.optimizedSize,
          category: galleryPhotoCategory,
        });
        setPlantNotification(`Replaced photo for "${replacingTargetPhoto.name}" successfully!`);
        setReplacingTargetPhoto(null);
      } else {
        await addPhotoToGallery({
          name: galleryPhotoName.trim() || galleryNewPhotoPreview.name,
          dataUrl: galleryNewPhotoPreview.dataUrl,
          originalSize: galleryNewPhotoPreview.originalSize,
          optimizedSize: galleryNewPhotoPreview.optimizedSize,
          dimensions: galleryNewPhotoPreview.dimensions,
          category: galleryPhotoCategory,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.email || DESIGNATED_MAIN_ADMIN_EMAIL,
        });
        setPlantNotification(`Uploaded photo "${galleryPhotoName || galleryNewPhotoPreview.name}" to Nursery Gallery!`);
      }

      setGalleryUploadProgress(100);
      setTimeout(() => {
        setGalleryNewPhotoPreview(null);
        setGalleryPhotoName('');
        setGalleryUploadProgress(0);
        setIsUploadingToGallery(false);
      }, 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploadingToGallery(false);
      setGalleryUploadProgress(0);
      alert(`Gallery upload error: ${err.message}`);
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string, photoName: string) => {
    if (confirm(`Are you sure you want to delete photo "${photoName}" from the gallery?`)) {
      try {
        await deletePhotoFromGallery(photoId);
        setPlantNotification(`Deleted "${photoName}" from photo gallery.`);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleCopyImageUrl = (url: string, photoId: string) => {
    navigator.clipboard.writeText(url);
    setGalleryCopySuccess(photoId);
    setTimeout(() => {
      setGalleryCopySuccess(null);
    }, 2000);
  };

  // Stats & Analytics Computations
  const totalStockUnits = plants.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValuation = plants.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const newOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  // Unified Login Analytics metrics across Admins and Customers
  const totalUploadedPhotosCount = mediaPhotos.length;
  const totalRegisteredUsersCount = Math.max(registeredUsers.length, 1);

  const isTodayDate = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    } catch {
      return false;
    }
  };

  const loginsTodayCount = 
    userSessions.filter((s) => isTodayDate(s.timestamp)).length +
    loginAuditLogs.filter((l) => isTodayDate(l.timestamp)).length;

  const totalLoginsCount = userSessions.length + loginAuditLogs.length;
  const totalSessionsCount = totalLoginsCount;
  const authorizedLoginsCount = 
    loginAuditLogs.filter((l) => l.status === 'authorized').length + 
    userSessions.filter((s) => s.status === 'success').length;
  const blockedAttemptsCount = loginAuditLogs.filter((l) => l.status !== 'authorized').length;

  const uniqueEmails = Array.from(new Set([
    ...loginAuditLogs.map((l) => l.email),
    ...userSessions.map((s) => s.email),
    ...registeredUsers.map((u) => u.email)
  ])).filter(Boolean);


  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                Maruthi Nursery
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Main Admin Portal
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Malladi Village • Amaravathi Road, Guntur District
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToCustomerPortal}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Customer Storefront</span>
          </button>

          {currentUser && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      {!isFullyAuthorized ? (
        /* Strict Security Gate / Login Screen */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Single-Admin Security Gate
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                This administration console is restricted under a strict single-member policy. Only the designated nursery owner account is authorized.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            {!currentUser ? (
              /* Step 1: Sign in with Primary Admin Account */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
                  <strong className="block text-stone-800 mb-0.5">Designated Administrator:</strong>
                  <code>{DESIGNATED_MAIN_ADMIN_EMAIL}</code>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{authLoading ? 'Verifying Admin...' : 'Sign In as Main Admin (Google)'}</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-3 text-stone-400 text-[10px] uppercase tracking-wider">or Email Credentials</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder={DESIGNATED_MAIN_ADMIN_EMAIL}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Authenticate Single Admin
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: Second Layer Condition - Master Nursery Passcode */
              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Logged in: <strong>{currentUser.email}</strong></span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 font-bold">Email Verified</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enter Master Passcode PIN (Security Condition)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={securityPasscode}
                    onChange={(e) => setSecurityPasscode(e.target.value)}
                    placeholder="Enter 4-digit security PIN (e.g. 9515)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Passcode PIN: <strong>9515</strong> (Maruthi Nursery WhatsApp phone key)
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                  >
                    Switch Account
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Unlock Portal
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={onReturnToCustomerPortal}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Customer Catalog</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Unlocked Full-Screen Admin Portal Dashboard */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Admin Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-4 border-r border-stone-800 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              
              {/* Authenticated Admin Identity */}
              <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Active Master Admin
                </span>
                <p className="font-semibold text-white truncate">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>PIN & Email Verified</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1.5 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Overview & Metrics</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Plant Inventory ({plants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Photo Gallery</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px]">
                    {totalUploadedPhotosCount} photos
                  </span>
                </button>


                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Orders Desk</span>
                  </div>
                  {newOrdersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-[10px] font-bold">
                      {newOrdersCount} new
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                    activeTab === 'enquiries'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Customer Enquiries</span>
                  </div>
                  {newEnquiriesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
                      {newEnquiriesCount} new
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('logins')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                    activeTab === 'logins'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Login Activity</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px]">
                    {totalLoginsCount} logs
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Firestore & Security</span>
                </button>
              </nav>

            </div>

            {/* Quick Actions at bottom of sidebar */}
            <div className="pt-6 border-t border-stone-800 space-y-2">
              <button
                onClick={handleSeedDatabase}
                disabled={seedLoading}
                className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{seedLoading ? 'Seeding Live DB...' : 'Seed Plants to DB'}</span>
              </button>

              <button
                onClick={onReturnToCustomerPortal}
                className="w-full py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>View Storefront</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            
            {/* Notification alert banner */}
            {plantNotification && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{plantNotification}</span>
                </div>
                <button onClick={() => setPlantNotification('')} className="text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 1: Overview & Metrics */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Nursery Performance Overview
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live operational statistics from Maruthi Nursery Cloud Firestore
                  </p>
                </div>

                {/* Metrics Cards Grid - Core Operational Analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Metric 1: Total Registered Users */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">
                      {totalRegisteredUsersCount}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 inline" />
                      <span>{uniqueEmails.length} unique profiles</span>
                    </span>
                  </div>

                  {/* Metric 2: Active Sessions / Total Logins Today */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Logins Today</span>
                      <Clock className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">
                      {loginsTodayCount}
                    </div>
                    <span className="text-[11px] text-stone-500">
                      {totalSessionsCount} total recorded sessions
                    </span>
                  </div>

                  {/* Metric 3: Total Uploaded Photos */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Uploaded Photos</span>
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">
                      {totalUploadedPhotosCount}
                    </div>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Gallery →</span>
                    </button>
                  </div>

                  {/* Metric 4: Plant Varieties Ready */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Plant Varieties</span>
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">{plants.length}</div>
                    <span className="text-[11px] text-stone-500">{totalStockUnits} saplings in beds</span>
                  </div>

                  {/* Metric 5: Catalog Valuation */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Catalog Valuation</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-emerald-700">₹{totalValuation.toLocaleString()}</div>
                    <span className="text-[11px] text-stone-500">Malladi wholesale value</span>
                  </div>
                </div>

                {/* Live Real-Time Login Logs Table (Core Requirement 3) */}
                <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Live User & Admin Login Sessions</span>
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Real-time audit table tracking user logins, emails, timestamps, and authentication status
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('logins')}
                      className="text-xs text-emerald-700 font-semibold hover:underline self-start sm:self-auto cursor-pointer"
                    >
                      Full Audit History ({totalSessionsCount}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                          <th className="pb-2.5">User / Email</th>
                          <th className="pb-2.5">Role</th>
                          <th className="pb-2.5">Timestamp</th>
                          <th className="pb-2.5">Device / Client</th>
                          <th className="pb-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {/* Combine user sessions and admin login records */}
                        {(() => {
                          const combined = [
                            ...userSessions.map((s) => ({
                              id: s.id || `session-${s.timestamp}`,
                              email: s.email,
                              name: s.displayName || s.email.split('@')[0],
                              role: s.role || 'customer',
                              timestamp: s.timestamp,
                              userAgent: s.userAgent,
                              status: s.status,
                            })),
                            ...loginAuditLogs.map((l) => ({
                              id: l.id || `admin-${l.timestamp}`,
                              email: l.email,
                              name: 'Nursery Admin',
                              role: 'admin' as const,
                              timestamp: l.timestamp,
                              userAgent: l.userAgent,
                              status: l.status === 'authorized' ? 'success' : 'denied',
                            })),
                          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                          if (combined.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-stone-400">
                                  No login sessions recorded yet. Customer and admin logins will stream here in real time.
                                </td>
                              </tr>
                            );
                          }

                          return combined.slice(0, 5).map((log, idx) => (
                            <tr key={log.id || idx} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-2.5 pr-2">
                                <strong className="block text-stone-900 font-medium">{log.email}</strong>
                                <span className="text-[11px] text-stone-500">{log.name}</span>
                              </td>
                              <td className="py-2.5 pr-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {log.role}
                                </span>
                              </td>
                              <td className="py-2.5 pr-2 text-stone-600 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="py-2.5 pr-2 text-stone-400 truncate max-w-[200px]">
                                {log.userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'}
                              </td>
                              <td className="py-2.5 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.status === 'success' || log.status === 'authorized'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {log.status === 'success' || log.status === 'authorized' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      <span>Success</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      <span>Denied</span>
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Orders and Enquiries Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Recent Orders Box */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>Recent Orders</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        View All ({orders.length})
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center">No orders recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-stone-100 text-xs">
                        {orders.slice(0, 4).map((ord) => (
                          <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                            <div>
                              <strong className="block text-stone-900">{ord.customerName}</strong>
                              <span className="text-stone-500">{ord.customerPhone}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-serif font-bold text-stone-900">₹{ord.totalAmount}</span>
                              <span className="block text-[10px] uppercase font-semibold text-emerald-700">{ord.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Customer Enquiries Box */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Recent Customer Enquiries</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('enquiries')}
                        className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        View All ({enquiries.length})
                      </button>
                    </div>

                    {enquiries.length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center">No enquiries recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-stone-100 text-xs">
                        {enquiries.slice(0, 4).map((enq) => (
                          <div key={enq.id} className="py-2.5 flex items-center justify-between gap-2">
                            <div>
                              <strong className="block text-stone-900">{enq.name}</strong>
                              <span className="text-stone-500">{enq.plantInterest || enq.phone}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                              {enq.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}


            {/* TAB 2: Plant Inventory Management */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Plant Catalog & Inventory
                    </h3>
                    <p className="text-xs text-stone-500">
                      Add, update prices, manage plant images, toggle availability, and synchronize live with Cloud Firestore
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={openAddPlant}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Plant</span>
                    </button>
                  </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search inventory by plant name, Telugu vernacular, or category..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Plant Inventory Table */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-3.5">Plant & Vernacular</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Price</th>
                          <th className="p-3.5">Stock Ready</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
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
                            <tr key={plant.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={plant.imageUrl}
                                    alt={plant.name}
                                    className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-stone-900 block">{plant.name}</span>
                                    {plant.teluguName && (
                                      <span className="text-[11px] text-emerald-700 font-medium">
                                        {plant.teluguName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                                  {plant.category}
                                </span>
                              </td>

                              <td className="p-3.5 font-bold font-serif text-stone-900 text-sm">
                                ₹{plant.price}
                              </td>

                              <td className="p-3.5 font-semibold text-stone-800">
                                {plant.stock} units
                              </td>

                              <td className="p-3.5">
                                <button
                                  onClick={() => handleToggleStock(plant)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                    plant.inStock
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                  title="Click to toggle stock state in Cloud Firestore"
                                >
                                  {plant.inStock ? 'In Stock' : 'Out of Stock'}
                                </button>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditPlant(plant)}
                                    className="p-1.5 rounded-lg border border-stone-200 hover:border-emerald-600 text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                    title="Edit plant"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlant(plant.id, plant.name)}
                                    className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-600 text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
                                    title="Delete plant"
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

            {/* TAB: Dedicated Photo Gallery & Media Manager */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-6 h-6 text-emerald-600" />
                      <span>Photo Gallery & Media Assets</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Upload, compress, and organize high-definition plant photography with direct catalog integration
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      {mediaPhotos.length} Photos in Gallery
                    </span>
                  </div>
                </div>

                {/* Photo Upload Module with Drag & Drop, Preview, & Progress Bar */}
                <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{replacingTargetPhoto ? `Replace Photo: ${replacingTargetPhoto.name}` : 'Upload New Plant Photo'}</span>
                    </h4>
                    {replacingTargetPhoto && (
                      <button
                        onClick={() => {
                          setReplacingTargetPhoto(null);
                          setGalleryNewPhotoPreview(null);
                        }}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Cancel Replacement
                      </button>
                    )}
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSelectGalleryFile(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {/* Drag & Drop Zone */}
                  {!galleryNewPhotoPreview ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setGalleryDragOver(true);
                      }}
                      onDragLeave={() => setGalleryDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setGalleryDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleSelectGalleryFile(file);
                      }}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        galleryDragOver
                          ? 'border-emerald-600 bg-emerald-50/80 scale-[1.01]'
                          : 'border-stone-300 hover:border-emerald-500 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      {isProcessingFile ? (
                        <div className="py-4 space-y-2">
                          <RefreshCw className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                          <p className="text-xs font-bold text-stone-900">
                            Optimizing & Scaling Photo via HTML5 Canvas...
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Compressing to high-definition web quality to fit Cloud Firestore limits
                          </p>
                        </div>
                      ) : (
                        <div className="py-2 space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                            <Camera className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-900">
                              Drag and drop plant photos here, or click to browse
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              Supports JPG, PNG, and WebP format from mobile phone camera or desktop
                            </p>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Image File</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Active Image Preview & Metadata Configuration Before Final Upload */
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img
                          src={galleryNewPhotoPreview.dataUrl}
                          alt="Upload preview"
                          className="w-28 h-24 object-cover rounded-xl border border-stone-300 shadow-sm shrink-0"
                        />
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Optimization Complete ({galleryNewPhotoPreview.originalSize} → {galleryNewPhotoPreview.optimizedSize})</span>
                            </span>
                            <span className="text-[11px] font-mono text-stone-500">
                              {galleryNewPhotoPreview.dimensions}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                Photo / Plant Title
                              </label>
                              <input
                                type="text"
                                value={galleryPhotoName}
                                onChange={(e) => setGalleryPhotoName(e.target.value)}
                                placeholder="e.g. Banganapalli Mango Sapling"
                                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                Category Tag
                              </label>
                              <select
                                value={galleryPhotoCategory}
                                onChange={(e) => setGalleryPhotoCategory(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                              >
                                <option value="Fruit Plants">Fruit Plants</option>
                                <option value="Flowering Plants">Flowering Plants</option>
                                <option value="Indoor & Air Purifying">Indoor & Air Purifying</option>
                                <option value="Medicinal & Herbal">Medicinal & Herbal</option>
                                <option value="Avenue & Shade Trees">Avenue & Shade Trees</option>
                                <option value="Bonsai & Exotic">Bonsai & Exotic</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload Progress Bar Indicator */}
                      {isUploadingToGallery && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs text-stone-600 font-semibold">
                            <span>Uploading to Firestore Media Bucket...</span>
                            <span>{galleryUploadProgress}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300 rounded-full"
                              style={{ width: `${galleryUploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Confirm Upload / Discard Buttons */}
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryNewPhotoPreview(null);
                            setReplacingTargetPhoto(null);
                          }}
                          disabled={isUploadingToGallery}
                          className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmGalleryUpload}
                          disabled={isUploadingToGallery}
                          className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingToGallery ? 'Publishing...' : replacingTargetPhoto ? 'Update Photo' : 'Save to Gallery'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Filter & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      placeholder="Search photo library by filename or plant name..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Vegetable Plants', 'Fruit Plants', 'Flowering Plants', 'Indoor & Air Purifying', 'Medicinal & Herbal'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGalleryFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          galleryFilterCategory === cat
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uploaded Photos Gallery Grid */}
                {(() => {
                  const filteredPhotos = mediaPhotos.filter((p) => {
                    const matchesCategory = galleryFilterCategory === 'All' || p.category === galleryFilterCategory;
                    const matchesSearch = !gallerySearch.trim() || 
                      p.name.toLowerCase().includes(gallerySearch.toLowerCase()) || 
                      (p.category && p.category.toLowerCase().includes(gallerySearch.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredPhotos.length === 0) {
                    return (
                      <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                        <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-stone-700">No photos match your filter</p>
                        <p className="text-xs text-stone-400 mt-1">
                          Try searching for another keyword or upload a fresh plant image above.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                        >
                          {/* Image Container with Hover Actions Overlay */}
                          <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                            <img
                              src={photo.dataUrl}
                              alt={photo.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              <button
                                onClick={() => setPreviewModalPhoto(photo)}
                                className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 transition-transform hover:scale-110 shadow-md cursor-pointer"
                                title="Inspect Fullscreen"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCopyImageUrl(photo.dataUrl, photo.id)}
                                className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 transition-transform hover:scale-110 shadow-md cursor-pointer"
                                title="Copy Image URL"
                              >
                                {galleryCopySuccess === photo.id ? (
                                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setReplacingTargetPhoto(photo);
                                  galleryFileInputRef.current?.click();
                                }}
                                className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 transition-transform hover:scale-110 shadow-md cursor-pointer"
                                title="Replace Photo File"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGalleryPhoto(photo.id, photo.name)}
                                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-transform hover:scale-110 shadow-md cursor-pointer"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Category Tag Badge */}
                            {photo.category && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                                {photo.category}
                              </span>
                            )}
                          </div>

                          {/* Metadata Card Footer */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                            <div>
                              <p className="font-bold text-stone-900 truncate" title={photo.name}>
                                {photo.name}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                                <span>{photo.optimizedSize || '120 KB'}</span>
                                <span>{photo.dimensions || '900 x 600'}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                              <span>
                                {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : 'Active'}
                              </span>
                              <button
                                onClick={() => handleCopyImageUrl(photo.dataUrl, photo.id)}
                                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                {galleryCopySuccess === photo.id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy URL</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Photo Preview Modal */}
            {previewModalPhoto && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                  <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm truncate max-w-md">{previewModalPhoto.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        {previewModalPhoto.category} • {previewModalPhoto.optimizedSize} • {previewModalPhoto.dimensions || 'HD Resolution'}
                      </p>
                    </div>
                    <button
                      onClick={() => setPreviewModalPhoto(null)}
                      className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-stone-950 p-2 flex items-center justify-center max-h-[60vh] overflow-hidden">
                    <img
                      src={previewModalPhoto.dataUrl}
                      alt={previewModalPhoto.name}
                      className="max-h-[58vh] max-w-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-stone-500 text-[11px]">
                      <span>Uploaded on: <strong>{new Date(previewModalPhoto.uploadedAt).toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyImageUrl(previewModalPhoto.dataUrl, previewModalPhoto.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Image Link</span>
                      </button>
                      <button
                        onClick={() => setPreviewModalPhoto(null)}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Orders Desk */}
            {activeTab === 'orders' && (

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Customer Plant Orders
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live orders submitted via WhatsApp & Cart checkout, synchronized with Cloud Firestore
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">No orders logged yet</p>
                    <p className="text-xs text-stone-400 mt-1">Orders placed via the cart flow appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-stone-900 text-base">{ord.customerName}</h4>
                              <span className="text-sm font-serif font-bold text-emerald-800">₹{ord.totalAmount}</span>
                            </div>
                            <p className="text-xs text-stone-600 mt-0.5">
                              Phone: <strong className="text-stone-900">{ord.customerPhone}</strong> • Fulfillment: <span className="capitalize font-semibold">{ord.deliveryType.replace('_', ' ')}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">Status:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => ord.id && updateOrderStatusInFirestore(ord.id, e.target.value as any)}
                              className="text-xs font-semibold rounded-lg px-2.5 py-1 border border-stone-200 bg-stone-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-800 font-medium">
                          {ord.itemsSummary}
                        </div>

                        {ord.deliveryAddress && (
                          <p className="text-xs text-stone-600">
                            <strong>Delivery Address:</strong> {ord.deliveryAddress}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                          <span>Placed: {new Date(ord.createdAt).toLocaleString()}</span>
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.customerName}! Greetings from Maruthi Nursery, Malladi. Regarding your plant order (Total: ₹${ord.totalAmount}): Your order status is currently "${ord.status}".`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer Reply</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Customer Enquiries */}
            {activeTab === 'enquiries' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Bulk Enquiries & Farm Consultation Desk
                  </h3>
                  <p className="text-xs text-stone-500">
                    Inquiries submitted from the website form, stored in Cloud Firestore
                  </p>
                </div>

                {enquiries.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                    <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">No customer enquiries logged</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enquiries.map((enq) => (
                      <div key={enq.id} className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">{enq.name}</h4>
                            <p className="text-xs text-stone-600">Phone: <strong>{enq.phone}</strong></p>
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

                        <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
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

            {/* TAB 5: How Many Peoples Login / Login Audit & Analytics */}
            {activeTab === 'logins' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    User Authentication & Login Tracking Analytics
                  </h3>
                  <p className="text-xs text-stone-500">
                    Real-time auditing of customer and admin logins, active sessions, registered users, and security logs
                  </p>
                </div>

                {/* 4 Login Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">{totalRegisteredUsersCount}</div>
                    <span className="text-[11px] text-emerald-700 font-medium">Verified customer accounts</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Logins Today</span>
                      <Clock className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-emerald-700">{loginsTodayCount}</div>
                    <span className="text-[11px] text-stone-500">Active today in 24 hours</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Login Sessions</span>
                      <Database className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-950">{totalLoginsCount}</div>
                    <span className="text-[11px] text-stone-500">Historical database sessions</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Blocked Attempts</span>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-rose-600">{blockedAttemptsCount}</div>
                    <span className="text-[11px] text-stone-500">Protected by security gate</span>
                  </div>
                </div>

                {/* Unified Real-Time Sessions Table */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Live User Session & Access Log</span>
                    </h4>
                    <span className="text-xs text-stone-500">
                      Auto-syncing live with Cloud Firestore
                    </span>
                  </div>

                  {(() => {
                    const allLogs = [
                      ...userSessions.map((s) => ({
                        id: s.id || `session-${s.timestamp}`,
                        userId: s.userId,
                        email: s.email,
                        name: s.displayName || s.email.split('@')[0],
                        role: s.role || 'customer',
                        timestamp: s.timestamp,
                        userAgent: s.userAgent,
                        status: s.status,
                      })),
                      ...loginAuditLogs.map((l) => ({
                        id: l.id || `admin-${l.timestamp}`,
                        userId: l.userId || 'admin-uid',
                        email: l.email,
                        name: 'Nursery Admin',
                        role: 'admin' as const,
                        timestamp: l.timestamp,
                        userAgent: l.userAgent,
                        status: l.status === 'authorized' ? 'success' : 'denied',
                      })),
                    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                    if (allLogs.length === 0) {
                      return (
                        <p className="text-xs text-stone-400 py-8 text-center">
                          No login activity logged yet in this session.
                        </p>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                              <th className="pb-3">User & Email</th>
                              <th className="pb-3">Role</th>
                              <th className="pb-3">User ID</th>
                              <th className="pb-3">Timestamp (Date & Time)</th>
                              <th className="pb-3">Browser / Platform</th>
                              <th className="pb-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {allLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                                <td className="py-3 pr-2">
                                  <strong className="block text-stone-900 font-semibold">{log.email}</strong>
                                  <span className="text-[11px] text-stone-500">{log.name}</span>
                                </td>
                                <td className="py-3 pr-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    log.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {log.role}
                                  </span>
                                </td>
                                <td className="py-3 pr-2 text-stone-400 font-mono text-[10px] truncate max-w-[120px]" title={log.userId}>
                                  {log.userId?.substring(0, 10)}...
                                </td>
                                <td className="py-3 pr-2 text-stone-600 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="py-3 pr-2 text-stone-500 truncate max-w-[180px]" title={log.userAgent}>
                                  {log.userAgent?.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'}
                                </td>
                                <td className="py-3 text-right whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    log.status === 'success' || log.status === 'authorized'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {log.status === 'success' || log.status === 'authorized' ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        <span>Authorized</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        <span>Denied</span>
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}


            {/* TAB 6: Security & Database Health */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Security Configuration & Firestore Health
                  </h3>
                  <p className="text-xs text-stone-500">
                    Single-member access control verification and database connectivity status
                  </p>
                </div>

                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">
                        Single-Member Admin Policy Active
                      </h4>
                      <p className="text-xs text-stone-500">
                        Only <code>{DESIGNATED_MAIN_ADMIN_EMAIL}</code> is granted write/edit access in Firestore security rules.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold">Firebase Project</span>
                      <p className="font-mono font-bold text-stone-900">{firebaseConfig.projectId}</p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold">Firestore Database ID</span>
                      <p className="font-mono font-bold text-stone-900">{firebaseConfig.firestoreDatabaseId}</p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold">Firestore Rules</span>
                      <p className="font-bold text-emerald-800">Hardened ABAC Rules Active</p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold">Security Passcode Condition</span>
                      <p className="font-bold text-emerald-800">Verified & Unlocked (PIN: 9515)</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* Add / Edit Plant Sub-Modal with Comprehensive Image Options */}
      {isAddingPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto space-y-5">
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

            <form onSubmit={handleSavePlant} className="space-y-5 text-xs">
              
              {/* Plant Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Plant Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={plantFormData.name || ''}
                    onChange={(e) => setPlantFormData({ ...plantFormData, name: e.target.value })}
                    placeholder="e.g. Banganapalli Grafted Mango"
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

              {/* Category, Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={plantFormData.category || 'Vegetable Plants'}
                    onChange={(e) => setPlantFormData({ ...plantFormData, category: e.target.value as PlantCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Vegetable Plants">Vegetable Plants</option>
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
                  <label className="block font-semibold text-stone-700 mb-1">Stock Units *</label>
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

              {/* IMAGE OPTION SUITE (URL, File Upload, or Curated Presets) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Plant Image Option *</span>
                  </label>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('presets')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        imageInputMode === 'presets' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Nursery Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        imageInputMode === 'url' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        imageInputMode === 'upload' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {/* Sub-view 1: Curated Nursery Presets */}
                {imageInputMode === 'presets' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-stone-500 block">Click any authentic nursery plant photo to select:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_PLANT_IMAGES.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPlantFormData({ ...plantFormData, imageUrl: preset.url })}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                            plantFormData.imageUrl === preset.url
                              ? 'border-emerald-600 ring-2 ring-emerald-400'
                              : 'border-stone-200 hover:border-emerald-400'
                          }`}
                          title={`${preset.name} (${preset.category})`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          {plantFormData.imageUrl === preset.url && (
                            <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center text-white">
                              <Check className="w-4 h-4 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-view 2: Paste URL */}
                {imageInputMode === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      value={plantFormData.imageUrl || ''}
                      onChange={(e) => setPlantFormData({ ...plantFormData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                      <span>Paste any image address (e.g. Unsplash, Cloudinary, Imgur).</span>
                      <button
                        type="button"
                        onClick={() => setPlantFormData({ 
                          ...plantFormData, 
                          imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' 
                        })}
                        className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        + Use Provided Mango Image URL
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-view 3: Responsive Photo File Upload with Camera & Canvas Optimization */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-3">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileSelect(file);
                        // Reset input value so selecting the same file again triggers change
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    {/* Interactive Drop & Tap Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileSelect(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
                          : 'border-stone-300 hover:border-emerald-500 bg-white hover:bg-stone-50'
                      }`}
                    >
                      {isProcessingFile ? (
                        <div className="py-4 space-y-2">
                          <RefreshCw className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                          <p className="text-xs font-bold text-stone-900">
                            Optimizing & Compressing Plant Photo...
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Scaling to HD catalog dimensions and fitting within Cloud Firestore
                          </p>
                        </div>
                      ) : (
                        <div className="py-2 space-y-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900">
                              Choose Photo from Mobile Camera or PC
                            </p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Tap to open camera/gallery, or drag & drop photo here
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select JPG / PNG File</span>
                          </div>

                          <p className="text-[10px] text-stone-400">
                            JPG, PNG, WebP supported • Automatic high-definition compression
                          </p>
                        </div>
                      )}
                    </div>

                    {/* File Upload Error Alert */}
                    {fileUploadError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{fileUploadError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFileUploadError('')}
                          className="text-rose-500 hover:text-rose-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Optimization Stats */}
                    {uploadedFileInfo && !fileUploadError && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold truncate block">{uploadedFileInfo.name}</span>
                            <span className="text-[10px] text-emerald-700">
                              {uploadedFileInfo.originalSize} → {uploadedFileInfo.optimizedSize} (Optimized for Firestore)
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Real-time Image Preview Thumbnail with Clear Option */}
                {plantFormData.imageUrl && (
                  <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={plantFormData.imageUrl}
                        alt="Selected preview"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0 shadow-xs"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-stone-800 flex items-center gap-1 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active Image Ready</span>
                        </span>
                        <p className="text-[11px] text-stone-500 truncate max-w-xs sm:max-w-md">
                          {uploadedFileInfo ? uploadedFileInfo.name : plantFormData.imageUrl}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPlantFormData((prev) => ({ ...prev, imageUrl: '' }));
                        setUploadedFileInfo(null);
                        setFileUploadError('');
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg border border-stone-200 hover:border-rose-300 transition-colors cursor-pointer"
                      title="Clear image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={plantFormData.description || ''}
                  onChange={(e) => setPlantFormData({ ...plantFormData, description: e.target.value })}
                  placeholder="Describe variety, fruit yield, soil suitability for Guntur/Amaravathi..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                ></textarea>
              </div>

              {/* Sunlight, Watering, Size */}
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

              {/* Dedicated Care Tips Section with Quick Presets */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <label className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                        Care Tips & Horticultural Guide
                      </label>
                      <span className="text-[11px] text-stone-500">
                        Displays in customer plant modal and care guide
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Care Template Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Fill Preset:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPlantFormData((prev) => ({
                          ...prev,
                          careTips: {
                            wateringFrequency: 'Water every 2 days; keep soil moist but never stagnant to prevent delicate flower drop.',
                            sunlightNeeds: 'Full direct sunlight (at least 6 hours daily) for heavy flowering and continuous pod production.',
                            soilPreference: 'Porous, well-draining red sandy loam with 30% vermicompost and cow dung manure.',
                            fertilizerSchedule: 'Top-dress with vermicompost every 15-20 days; apply wood ash or seaweed extract during flowering.',
                            pruningTips: 'Pinch terminal tip at 6-8 inches height to stimulate multiple bushy fruit-bearing lateral stems.',
                            seasonalCare: 'Thrives in Guntur warm climate; spray neem oil solution (5ml/L) monthly to repel whiteflies and leaf curl.',
                            growthNotes: 'Continuous harvest starts within 60-75 days of transplanting; yields fresh vegetables for months.'
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-stone-200 hover:border-emerald-500 text-[10px] font-semibold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      🌶️ Vegetable Plant
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlantFormData((prev) => ({
                          ...prev,
                          careTips: {
                            wateringFrequency: 'Water deeply 2-3 times a week in early morning. Reduce watering during winter flowering stage.',
                            sunlightNeeds: 'Full uninterrupted direct sunlight (6 to 8 hours daily) for maximum fruit setting and sweet pulp.',
                            soilPreference: 'Deep, well-draining red loamy or alluvial soil enriched with decomposed manure.',
                            fertilizerSchedule: 'Apply 3-5 kg vermicompost or organic compost every 45-60 days; supplement with bone meal prior to blooming.',
                            pruningTips: 'Remove rootstock suckers below graft union immediately; thin canopy post-harvest.',
                            seasonalCare: 'Mulch root zone generously in April-May heat to conserve moisture and protect feeder roots.',
                            growthNotes: 'Authentic grafted sapling; yields first commercial harvest within 2-3 years.'
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-stone-200 hover:border-emerald-500 text-[10px] font-semibold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      🍎 Fruit Tree
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlantFormData((prev) => ({
                          ...prev,
                          careTips: {
                            wateringFrequency: 'Water daily in the morning during blooming months; avoid wetting open petals directly.',
                            sunlightNeeds: 'Bright direct morning sun (5-7 hours daily) for continuous, fragrant flower bud formation.',
                            soilPreference: 'Fertile, moist, well-drained garden soil enriched with vermicompost.',
                            fertilizerSchedule: 'Feed mustard cake tea or banana peel organic liquid every 15 days from spring to autumn.',
                            pruningTips: 'Prune stems back by 30% in late winter to stimulate dense, floriferous branching.',
                            seasonalCare: 'Shield tender buds from scorching mid-day May sun using light shade cloth.',
                            growthNotes: 'Heavy bloomer providing daily flowers for pooja rituals and home garland decor.'
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-stone-200 hover:border-emerald-500 text-[10px] font-semibold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      🌸 Flower Shrub
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlantFormData((prev) => ({
                          ...prev,
                          careTips: {
                            wateringFrequency: 'Water when top 1-2 inches of soil are dry. Allow excess water to drain out freely.',
                            sunlightNeeds: 'Bright indirect filtered light near windows; avoid harsh direct afternoon rays.',
                            soilPreference: 'Lightweight potting mix with 40% cocopeat, 30% vermicompost, 20% soil, and 10% perlite.',
                            fertilizerSchedule: 'Feed with balanced liquid houseplant food once every 30 days during active spring/summer months.',
                            pruningTips: 'Gently wipe leaves with damp microfiber cloth monthly; trim yellowing bottom fronds at base.',
                            seasonalCare: 'Mist foliage twice weekly in dry weather; keep away from direct air conditioner chill.',
                            growthNotes: 'NASA-recommended air-purifier; detoxifies indoor toxins and humidifies indoor living spaces.'
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-stone-200 hover:border-emerald-500 text-[10px] font-semibold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      🌿 Indoor Air-Plant
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>Watering Frequency & Advice</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.wateringFrequency || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, wateringFrequency: e.target.value }
                      })}
                      placeholder="e.g. Deep watering twice weekly; avoid waterlogging around roots"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Sunlight Exposure Needs</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.sunlightNeeds || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, sunlightNeeds: e.target.value }
                      })}
                      placeholder="e.g. Full direct sunlight (6-8 hrs daily) for sweet yield"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      <span>Soil Preference & Mix</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.soilPreference || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, soilPreference: e.target.value }
                      })}
                      placeholder="e.g. Red loamy soil with 30% organic compost"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fertilizer Schedule</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.fertilizerSchedule || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, fertilizerSchedule: e.target.value }
                      })}
                      placeholder="e.g. Vermicompost every 30 days + bone meal before blooming"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-stone-600" />
                      <span>Pruning & Training Tips</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.pruningTips || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, pruningTips: e.target.value }
                      })}
                      placeholder="e.g. Prune post-monsoon; remove suckers below graft"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Seasonal & Climate Care</span>
                    </label>
                    <input
                      type="text"
                      value={plantFormData.careTips?.seasonalCare || ''}
                      onChange={(e) => setPlantFormData({
                        ...plantFormData,
                        careTips: { ...plantFormData.careTips, seasonalCare: e.target.value }
                      })}
                      placeholder="e.g. Mulch around root zone during Guntur May summer"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Agronomist / Growth & Yield Note</span>
                  </label>
                  <input
                    type="text"
                    value={plantFormData.careTips?.growthNotes || ''}
                    onChange={(e) => setPlantFormData({
                      ...plantFormData,
                      careTips: { ...plantFormData.careTips, growthNotes: e.target.value }
                    })}
                    placeholder="e.g. High survival rate; yields fresh sweet fruits within 18-24 months"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  <span className="font-semibold text-stone-800">Featured in Storefront</span>
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
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
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
