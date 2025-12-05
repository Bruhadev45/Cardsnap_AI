import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { User } from '../types';

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
