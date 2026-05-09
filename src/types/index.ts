import { Timestamp } from "firebase/firestore";

export interface Deal {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string;
  offerPercentage: number;
  category: string;
  status: 'live' | 'upcoming' | 'ended';
  description?: string;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  featured: boolean;
  clickCount: number;
  platform: string;
  price: number;
  originalPrice: number;
  dealType: 'shopping' | 'earn';
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  createdAt: any;
}

export type DealInput = Omit<Deal, 'id' | 'createdAt' | 'clickCount'>;
