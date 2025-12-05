import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Contact } from '../types';
import { getCurrentUser } from './firebaseAuthService';

const CONTACTS_COLLECTION = 'contacts';

// Helper function to remove undefined fields
const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

// Save or update contact
export const saveContact = async (contact: Contact): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not logged in');

    const contactWithUser = {
      ...contact,
      userId: user.id,
      scannedAt: contact.scannedAt || new Date().toISOString(),
    };

    // Remove undefined fields before saving to Firestore
    const cleanedContact = removeUndefinedFields(contactWithUser);

    await setDoc(
      doc(db, CONTACTS_COLLECTION, contact.id),
      cleanedContact
    );
  } catch (error: any) {
    console.error('Save error:', error);
    throw new Error('Failed to save contact');
  }
};

// Update contact
export const updateContact = async (contact: Contact): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not logged in');

    const contactWithUser = {
      ...contact,
      userId: user.id,
    };

    // Remove undefined fields before saving to Firestore
    const cleanedContact = removeUndefinedFields(contactWithUser);

    await setDoc(
      doc(db, CONTACTS_COLLECTION, contact.id),
      cleanedContact
    );
  } catch (error: any) {
    console.error('Update error:', error);
    throw new Error('Failed to update contact');
  }
};

// Get all contacts for current user
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const q = query(
      collection(db, CONTACTS_COLLECTION),
      where('userId', '==', user.id)
    );

    const querySnapshot = await getDocs(q);
    const contacts: Contact[] = [];

    querySnapshot.forEach((doc) => {
      contacts.push(doc.data() as Contact);
    });

    // Sort by scannedAt in JavaScript instead of Firestore
    return contacts.sort((a, b) => {
      const dateA = new Date(a.scannedAt).getTime();
      const dateB = new Date(b.scannedAt).getTime();
      return dateB - dateA; // desc order (newest first)
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};

// Delete contact
export const deleteContact = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CONTACTS_COLLECTION, id));
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete contact');
  }
};

// Clear all contacts for current user
export const clearAllContacts = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) return;

    const contacts = await getContacts();

    const deletePromises = contacts.map((contact) =>
      deleteDoc(doc(db, CONTACTS_COLLECTION, contact.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Clear error:', error);
  }
};

// Get storage usage (approximate)
export const getStorageUsage = async (): Promise<string> => {
  try {
    const contacts = await getContacts();
    const json = JSON.stringify(contacts);
    const bytes = new TextEncoder().encode(json).length;
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  } catch (error) {
    return '0 KB';
  }
};
