import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'SHOP' | 'DRIVER';
  points: number;
  active: boolean;
  approved: boolean;
}

export interface Shop {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  active: boolean;
  owner: { id: string; name: string; phone: string };
}

export interface Order {
  id: string;
  shopId: string;
  description: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  deliveryFee: number;
  pointsCost: number;
  createdById: string;
  acceptedDriverId: string | null;
  createdAt: string;
  updatedAt: string;
  shop: { id: string; name: string; type: string; address?: string; phone?: string };
  createdBy: { id: string; name: string };
  acceptedDriver: { id: string; name: string; phone: string } | null;
  offers: DeliveryOffer[];
}

export interface DeliveryOffer {
  id: string;
  orderId: string;
  driverId: string;
  price: number;
  status: string;
  createdAt: string;
  driver: { id: string; name: string; phone: string; points?: number };
  order?: { id: string; description: string; status: string; shop: { name: string; address: string } };
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  senderPhone: string;
  senderName: string;
  receiptNumber: string | null;
  status: string;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; phone: string; points?: number };
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  accountName: string;
  accountPhone: string;
  instructions: string;
}

type ViewType =
  | 'login'
  | 'register'
  | 'admin-dashboard'
  | 'admin-shops'
  | 'admin-users'
  | 'admin-orders'
  | 'admin-payments'
  | 'admin-approvals'
  | 'admin-earnings'
  | 'admin-payment-settings'
  | 'shop-dashboard'
  | 'shop-create-order'
  | 'shop-orders'
  | 'driver-dashboard'
  | 'driver-available'
  | 'driver-my-offers'
  | 'driver-my-deliveries'
  | 'driver-points';

interface AppState {
  user: User | null;
  currentView: ViewType;
  sidebarOpen: boolean;

  setUser: (user: User | null) => void;
  setCurrentView: (view: ViewType) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentView: 'login',
  sidebarOpen: false,

  setUser: (user) => set({ user }),
  setCurrentView: (currentView) => set({ currentView, sidebarOpen: false }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  logout: () => set({ user: null, currentView: 'login', sidebarOpen: false }),
}));
