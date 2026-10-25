import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testFirestoreConnection } from './firebase';
import { Plant } from './types/nursery';
import { subscribeToPlants } from './services/nurseryService';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);

  // Portal routing state: 'customer' vs 'admin'
  const [currentPortal, setCurrentPortal] = useState<'customer' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'customer';
  });

  // Keep hash in sync with portal state
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPortal('admin');
      } else {
        setCurrentPortal('customer');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAdminPortal = () => {
    window.location.hash = '#admin';
    setCurrentPortal('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomerPortal = () => {
    window.location.hash = '#customer';
    setCurrentPortal('customer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Test Firestore connection on initial boot
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore ping note:', err);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Plants from Cloud Firestore
  useEffect(() => {
    setIsLoadingPlants(true);
    const unsubscribe = subscribeToPlants(
      (loadedPlants) => {
        setPlants(loadedPlants);
        setIsLoadingPlants(false);
      },
      (error) => {
        console.warn('Plants subscription note:', error);
        setIsLoadingPlants(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {currentPortal === 'admin' ? (
        <AdminPortal
          onReturnToCustomerPortal={navigateToCustomerPortal}
          plants={plants}
          currentUser={currentUser}
        />
      ) : (
        <CustomerPortal
          plants={plants}
          isLoadingPlants={isLoadingPlants}
          currentUser={currentUser}
          onOpenAdminPortal={navigateToAdminPortal}
        />
      )}
    </>
  );
}
