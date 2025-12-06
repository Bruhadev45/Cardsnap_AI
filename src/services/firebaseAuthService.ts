import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ApplicationVerifier,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { User } from '../types';

// Import Google Sign-In conditionally
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;

  // Configure Google Sign-In only if module is available
  if (GoogleSignin && process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
    });
  }
} catch (error) {
  // Google Sign-In requires native build - this is expected in Expo Go
  // Silently fail - error will be shown to user when they try to use it
}

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
  };
};

// Register new user
export const register = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: name,
    });

    return convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('User with this email already exists');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    throw new Error(error.message || 'Registration failed');
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid credentials');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    throw new Error(error.message || 'Login failed');
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    return convertFirebaseUser(firebaseUser);
  }
  return null;
};

// Auto-login check
export const tryAutoLogin = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        resolve(convertFirebaseUser(firebaseUser));
      } else {
        resolve(null);
      }
    });
  });
};

// Update user profile
export const updateUser = async (updatedUser: User): Promise<User> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not logged in');

    await updateProfile(currentUser, {
      displayName: updatedUser.name,
    });

    return convertFirebaseUser(currentUser);
  } catch (error: any) {
    throw new Error(error.message || 'Update failed');
  }
};

// Listen to auth state changes
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(convertFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  // Check if Google Sign-In is available
  if (!GoogleSignin) {
    throw new Error(
      'Google Sign-In is not available. Please run "npx expo prebuild" and rebuild the app to enable this feature.'
    );
  }

  try {
    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in with Google
    const response = await GoogleSignin.signIn();

    // Get ID token from response
    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    // Create Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, googleCredential);

    return convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Sign-in cancelled');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Sign-in already in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services not available');
    }
    throw new Error(error.message || 'Google Sign-In failed');
  }
};

// Phone Number Sign-In (Step 1: Send verification code)
export const sendPhoneVerification = async (
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
): Promise<any> => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return confirmationResult;
  } catch (error: any) {
    console.error('Phone verification error:', error);
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    }
    throw new Error(error.message || 'Failed to send verification code');
  }
};

// Phone Number Sign-In (Step 2: Verify code)
export const verifyPhoneCode = async (
  confirmationResult: any,
  verificationCode: string
): Promise<User> => {
  try {
    const userCredential = await confirmationResult.confirm(verificationCode);
    return convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('Phone verification error:', error);
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Verification code expired');
    }
    throw new Error(error.message || 'Verification failed');
  }
};
