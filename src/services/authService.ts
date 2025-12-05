import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getAllUsers,
  saveUser,
  updateUserData,
} from './storageService';

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const normalizedEmail = email.toLowerCase().trim();
  const users = await getAllUsers();

  const existingUser = users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const newUser: User = {
    id: uuidv4(),
    email: normalizedEmail,
    name: name.trim(),
    password,
  };

  await saveUser(newUser);
  await setCurrentUser({ id: newUser.id, email: newUser.email, name: newUser.name });

  return { id: newUser.id, email: newUser.email, name: newUser.name };
};

export const login = async (email: string, password: string): Promise<User> => {
  const normalizedEmail = email.toLowerCase().trim();
  const users = await getAllUsers();

  const user = users.find(u => u.email === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }

  const userSession = { id: user.id, email: user.email, name: user.name };
  await setCurrentUser(userSession);

  return userSession;
};

export const logout = async (): Promise<void> => {
  await clearCurrentUser();
};

export const tryAutoLogin = async (): Promise<User | null> => {
  try {
    const session = await getCurrentUser();
    if (!session) return null;

    const users = await getAllUsers();
    const user = users.find(u => u.id === session.id && u.email === session.email);

    if (user) {
      return { id: user.id, email: user.email, name: user.name };
    }

    await clearCurrentUser();
    return null;
  } catch (error) {
    await clearCurrentUser();
    return null;
  }
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  const users = await getAllUsers();
  const existingUser = users.find(u => u.id === updatedUser.id);

  if (!existingUser) throw new Error("User not found");

  if (updatedUser.email !== existingUser.email) {
    const emailExists = users.find(
      u => u.email === updatedUser.email && u.id !== updatedUser.id
    );
    if (emailExists) {
      throw new Error("Email already in use");
    }
  }

  const userToSave = { ...existingUser, ...updatedUser };
  await updateUserData(userToSave);

  const newSession = { id: userToSave.id, email: userToSave.email, name: userToSave.name };
  await setCurrentUser(newSession);

  return newSession;
};
