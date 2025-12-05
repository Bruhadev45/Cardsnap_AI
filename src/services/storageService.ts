import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, User } from '../types';

const CONTACTS_KEY = 'cardsnap_contacts';
const USERS_KEY = 'cardsnap_users';
const SESSION_KEY = 'cardsnap_session';

// Contacts
export const saveContact = async (contact: Contact): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not logged in");

    const contactWithUser = { ...contact, userId: user.id };
    const contacts = await getContacts();
    const updatedContacts = [contactWithUser, ...contacts];

    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updatedContacts));
  } catch (error) {
    console.error("Save error:", error);
    throw new Error("Failed to save contact");
  }
};

export const updateContact = async (contact: Contact): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not logged in");

    const contacts = await getContacts();
    const updatedContacts = contacts.map(c =>
      c.id === contact.id ? { ...contact, userId: user.id } : c
    );

    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updatedContacts));
  } catch (error) {
    console.error("Update error:", error);
    throw new Error("Failed to update contact");
  }
};

export const getContacts = async (): Promise<Contact[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const data = await AsyncStorage.getItem(CONTACTS_KEY);
    if (!data) return [];

    const allContacts: Contact[] = JSON.parse(data);
    const userContacts = allContacts.filter(c => c.userId === user.id);

    return userContacts.sort((a, b) =>
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const contacts = await getContacts();
    const updatedContacts = contacts.filter(c => c.id !== id);

    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updatedContacts));
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete contact");
  }
};

export const clearAllContacts = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const data = await AsyncStorage.getItem(CONTACTS_KEY);
    if (!data) return;

    const allContacts: Contact[] = JSON.parse(data);
    const otherUsersContacts = allContacts.filter(c => c.userId !== user.id);

    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(otherUsersContacts));
  } catch (error) {
    console.error("Clear error:", error);
  }
};

export const getStorageUsage = async (): Promise<string> => {
  try {
    const contacts = await getContacts();
    const json = JSON.stringify(contacts);
    // Calculate byte size (each character is roughly 1-2 bytes in UTF-16)
    const bytes = new TextEncoder().encode(json).length;
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  } catch (error) {
    return '0 KB';
  }
};

// Auth
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
};

export const setCurrentUser = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearCurrentUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const saveUser = async (user: User): Promise<void> => {
  const users = await getAllUsers();
  const updatedUsers = [...users, user];
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
};

export const updateUserData = async (user: User): Promise<void> => {
  const users = await getAllUsers();
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
};
