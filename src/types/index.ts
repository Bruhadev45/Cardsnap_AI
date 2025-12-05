export interface Contact {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  scannedAt: string; // ISO date string
  rawText?: string;
  frontImage: string; // Base64
  backImage?: string; // Base64
  tags?: string[];
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Dashboard: undefined;
  Scanner: undefined;
  Assistant: undefined;
  ContactDetail: { contact: Contact };
  Profile: undefined;
};
