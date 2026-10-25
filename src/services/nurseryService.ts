import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Plant, CustomerEnquiry, NurseryOrder, UploadedPhoto, UserProfile, UserSessionLog } from '../types/nursery';
import { INITIAL_PLANTS } from '../data/initialPlants';


const PLANTS_COLLECTION = 'plants';
const ENQUIRIES_COLLECTION = 'enquiries';
const ORDERS_COLLECTION = 'orders';

/**
 * Real-time listener for plants from Cloud Firestore
 */
export function subscribeToPlants(
  onSuccess: (plants: Plant[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const plantsRef = collection(db, PLANTS_COLLECTION);
    const q = query(plantsRef);

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty, return initial catalog
          onSuccess(INITIAL_PLANTS);
        } else {
          const plants: Plant[] = [];
          snapshot.forEach((docSnap) => {
            plants.push({
              ...(docSnap.data() as Plant),
              id: docSnap.id,
            });
          });
          onSuccess(plants);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error for plants:', error);
        // Fallback to initial plants so UI remains functional
        onSuccess(INITIAL_PLANTS);
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.GET, PLANTS_COLLECTION);
        } catch {
          // Keep UI resilient
        }
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to plants:', error);
    onSuccess(INITIAL_PLANTS);
    return () => {};
  }
}

/**
 * Seed initial real plants into Firestore
 */
export async function seedPlantsToFirestore(): Promise<{ count: number }> {
  try {
    const batch = writeBatch(db);
    for (const plant of INITIAL_PLANTS) {
      const plantDocRef = doc(db, PLANTS_COLLECTION, plant.id);
      batch.set(plantDocRef, {
        ...plant,
        createdAt: plant.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
    return { count: INITIAL_PLANTS.length };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PLANTS_COLLECTION);
  }
}

/**
 * Add a new plant to Cloud Firestore
 */
export async function addPlantToFirestore(plant: Omit<Plant, 'id'> & { id?: string }): Promise<string> {
  const plantId = plant.id || `plant-${Date.now()}`;
  const path = `${PLANTS_COLLECTION}/${plantId}`;
  try {
    const plantDocRef = doc(db, PLANTS_COLLECTION, plantId);
    await setDoc(plantDocRef, {
      ...plant,
      id: plantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return plantId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update an existing plant in Cloud Firestore
 */
export async function updatePlantInFirestore(plantId: string, updates: Partial<Plant>): Promise<void> {
  const path = `${PLANTS_COLLECTION}/${plantId}`;
  try {
    const plantDocRef = doc(db, PLANTS_COLLECTION, plantId);
    await updateDoc(plantDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a plant from Cloud Firestore
 */
export async function deletePlantFromFirestore(plantId: string): Promise<void> {
  const path = `${PLANTS_COLLECTION}/${plantId}`;
  try {
    const plantDocRef = doc(db, PLANTS_COLLECTION, plantId);
    await deleteDoc(plantDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Submit customer enquiry to Cloud Firestore
 */
export async function submitCustomerEnquiry(enquiry: Omit<CustomerEnquiry, 'id' | 'createdAt' | 'status'> & { plantInterest?: string }): Promise<string> {
  try {
    const enquiriesRef = collection(db, ENQUIRIES_COLLECTION);
    const docRef = await addDoc(enquiriesRef, {
      ...enquiry,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ENQUIRIES_COLLECTION);
  }
}

/**
 * Subscribe to customer enquiries (Admin feature)
 */
export function subscribeToEnquiries(
  onSuccess: (enquiries: CustomerEnquiry[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const enquiriesRef = collection(db, ENQUIRIES_COLLECTION);
    return onSnapshot(
      enquiriesRef,
      (snapshot) => {
        const enquiries: CustomerEnquiry[] = [];
        snapshot.forEach((snap) => {
          enquiries.push({
            ...(snap.data() as CustomerEnquiry),
            id: snap.id,
          });
        });
        // Sort descending by date
        enquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onSuccess(enquiries);
      },
      (error) => {
        console.warn('Enquiries onSnapshot warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to enquiries:', error);
    return () => {};
  }
}

/**
 * Update enquiry status in Firestore
 */
export async function updateEnquiryStatusInFirestore(enquiryId: string, status: CustomerEnquiry['status']): Promise<void> {
  const path = `${ENQUIRIES_COLLECTION}/${enquiryId}`;
  try {
    const docRef = doc(db, ENQUIRIES_COLLECTION, enquiryId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Submit order to Cloud Firestore
 */
export async function submitOrderToFirestore(order: Omit<NurseryOrder, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(ordersRef, {
      ...order,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ORDERS_COLLECTION);
  }
}

/**
 * Subscribe to orders (Admin feature)
 */
export function subscribeToOrders(
  onSuccess: (orders: NurseryOrder[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    return onSnapshot(
      ordersRef,
      (snapshot) => {
        const orders: NurseryOrder[] = [];
        snapshot.forEach((snap) => {
          orders.push({
            ...(snap.data() as NurseryOrder),
            id: snap.id,
          });
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onSuccess(orders);
      },
      (error) => {
        console.warn('Orders onSnapshot warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to orders:', error);
    return () => {};
  }
}

/**
 * Update order status
 */
export async function updateOrderStatusInFirestore(orderId: string, status: NurseryOrder['status']): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

const LOGINS_COLLECTION = 'admin_logins';

/**
 * Record an admin login attempt in Cloud Firestore
 */
export async function logAdminLoginAttempt(record: {
  email: string;
  userId?: string;
  status: 'authorized' | 'denied_unauthorized_email' | 'denied_passcode';
  userAgent?: string;
}): Promise<string | undefined> {
  try {
    const loginsRef = collection(db, LOGINS_COLLECTION);
    const docRef = await addDoc(loginsRef, {
      ...record,
      timestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Login audit log note:', err);
    return undefined;
  }
}

/**
 * Subscribe to admin login logs to see how many people logged in
 */
export function subscribeToAdminLogins(
  onSuccess: (logins: any[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const loginsRef = collection(db, LOGINS_COLLECTION);
    return onSnapshot(
      loginsRef,
      (snapshot) => {
        const logs: any[] = [];
        snapshot.forEach((snap) => {
          logs.push({
            ...snap.data(),
            id: snap.id,
          });
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onSuccess(logs);
      },
      (error) => {
        console.warn('Logins onSnapshot note:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to admin logins:', err);
    return () => {};
  }
}

const MEDIA_COLLECTION = 'media_gallery';
const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';

// Seed starter media photos if gallery is empty
export const DEFAULT_GALLERY_PHOTOS: UploadedPhoto[] = [
  {
    id: 'photo-mango-1',
    name: 'banganapalli-mango-sapling.jpg',
    dataUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    originalSize: '1.8 MB',
    optimizedSize: '112 KB',
    dimensions: '900 x 600',
    category: 'Fruit Plants',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    uploadedBy: 'rockstarpurna80@gmail.com',
  },
  {
    id: 'photo-guava-2',
    name: 'thai-pink-guava-flowering.jpg',
    dataUrl: 'https://images.unsplash.com/photo-1536511135899-73e481b0a2c4?auto=format&fit=crop&w=800&q=80',
    originalSize: '2.4 MB',
    optimizedSize: '138 KB',
    dimensions: '900 x 675',
    category: 'Fruit Plants',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    uploadedBy: 'rockstarpurna80@gmail.com',
  },
  {
    id: 'photo-jasmine-3',
    name: 'mogra-jasmine-fragrant.jpg',
    dataUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
    originalSize: '1.2 MB',
    optimizedSize: '94 KB',
    dimensions: '900 x 600',
    category: 'Flowering Plants',
    uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    uploadedBy: 'rockstarpurna80@gmail.com',
  },
  {
    id: 'photo-areca-4',
    name: 'areca-palm-indoor-air-purifier.jpg',
    dataUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    originalSize: '3.1 MB',
    optimizedSize: '142 KB',
    dimensions: '900 x 600',
    category: 'Indoor & Air Purifying',
    uploadedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    uploadedBy: 'rockstarpurna80@gmail.com',
  },
  {
    id: 'photo-hibiscus-5',
    name: 'hybrid-hibiscus-red-blossom.jpg',
    dataUrl: 'https://images.unsplash.com/photo-1588628566587-dbd176de94b4?auto=format&fit=crop&w=800&q=80',
    originalSize: '2.1 MB',
    optimizedSize: '128 KB',
    dimensions: '900 x 600',
    category: 'Flowering Plants',
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    uploadedBy: 'rockstarpurna80@gmail.com',
  },
];

/**
 * Real-time listener for Media Gallery photos
 */
export function subscribeToMediaGallery(
  onSuccess: (photos: UploadedPhoto[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const galleryRef = collection(db, MEDIA_COLLECTION);
    return onSnapshot(
      galleryRef,
      (snapshot) => {
        if (snapshot.empty) {
          onSuccess(DEFAULT_GALLERY_PHOTOS);
        } else {
          const photos: UploadedPhoto[] = [];
          snapshot.forEach((snap) => {
            photos.push({
              ...(snap.data() as UploadedPhoto),
              id: snap.id,
            });
          });
          photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          onSuccess(photos);
        }
      },
      (error) => {
        console.warn('Media gallery snapshot error, using fallback:', error);
        onSuccess(DEFAULT_GALLERY_PHOTOS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to media gallery:', err);
    onSuccess(DEFAULT_GALLERY_PHOTOS);
    return () => {};
  }
}

/**
 * Add uploaded photo to Media Gallery
 */
export async function addPhotoToGallery(photo: Omit<UploadedPhoto, 'id'> & { id?: string }): Promise<string> {
  const photoId = photo.id || `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `${MEDIA_COLLECTION}/${photoId}`;
  try {
    const docRef = doc(db, MEDIA_COLLECTION, photoId);
    await setDoc(docRef, {
      ...photo,
      id: photoId,
      uploadedAt: photo.uploadedAt || new Date().toISOString(),
    });
    return photoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete photo from Media Gallery
 */
export async function deletePhotoFromGallery(photoId: string): Promise<void> {
  const path = `${MEDIA_COLLECTION}/${photoId}`;
  try {
    const docRef = doc(db, MEDIA_COLLECTION, photoId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Replace photo in Media Gallery
 */
export async function replacePhotoInGallery(photoId: string, updates: Partial<UploadedPhoto>): Promise<void> {
  const path = `${MEDIA_COLLECTION}/${photoId}`;
  try {
    const docRef = doc(db, MEDIA_COLLECTION, photoId);
    await updateDoc(docRef, {
      ...updates,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Register or update user profile upon login
 */
export async function recordUserLogin(userData: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'admin' | 'customer';
}): Promise<void> {
  const userId = userData.uid;
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const existingSnap = await getDoc(userDocRef);
    const now = new Date().toISOString();

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      await updateDoc(userDocRef, {
        lastLoginAt: now,
        loginCount: (data.loginCount || 1) + 1,
        displayName: userData.displayName || data.displayName || 'Customer',
        email: userData.email,
        photoURL: userData.photoURL || data.photoURL || '',
      });
    } else {
      await setDoc(userDocRef, {
        id: userId,
        uid: userId,
        email: userData.email,
        displayName: userData.displayName || 'Customer',
        photoURL: userData.photoURL || '',
        role: userData.role || (userData.email === 'rockstarpurna80@gmail.com' ? 'admin' : 'customer'),
        createdAt: now,
        lastLoginAt: now,
        loginCount: 1,
      });
    }
  } catch (err) {
    console.warn('Record user login note:', err);
  }
}

/**
 * Subscribe to all registered users (for Admin Metrics)
 */
export function subscribeToUsers(
  onSuccess: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    return onSnapshot(
      usersRef,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((snap) => {
          users.push({
            ...(snap.data() as UserProfile),
            id: snap.id,
          });
        });
        users.sort((a, b) => new Date(b.lastLoginAt || b.createdAt).getTime() - new Date(a.lastLoginAt || a.createdAt).getTime());
        onSuccess(users);
      },
      (error) => {
        console.warn('Users onSnapshot note:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to users:', err);
    return () => {};
  }
}

/**
 * Log session event (Every login logs user ID, email, name, timestamp, role, status)
 */
export async function logUserSession(sessionData: Omit<UserSessionLog, 'id'>): Promise<string | undefined> {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      timestamp: sessionData.timestamp || new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Session log note:', err);
    return undefined;
  }
}

/**
 * Subscribe to all user session logs (Real-time analytics for Admin Portal)
 */
export function subscribeToUserSessions(
  onSuccess: (sessions: UserSessionLog[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    return onSnapshot(
      sessionsRef,
      (snapshot) => {
        const logs: UserSessionLog[] = [];
        snapshot.forEach((snap) => {
          logs.push({
            ...(snap.data() as UserSessionLog),
            id: snap.id,
          });
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onSuccess(logs);
      },
      (error) => {
        console.warn('User sessions onSnapshot note:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to user sessions:', err);
    return () => {};
  }
}


