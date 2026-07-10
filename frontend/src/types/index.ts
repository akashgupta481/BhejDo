export type UserRole = 'SENDER' | 'TRAVELER' | 'AGENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  address: string;
  verified: number;
  wallet_balance: number;
  created_at: string;
  // Aliases for camelCase access used in some components
  isVerified?: boolean;
  walletBalance?: number;
  createdAt?: string;
}

export type ParcelStatus =
  | 'CREATED'
  | 'MATCHED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Parcel {
  id: string;
  tracking_code: string;
  sender_id: string;
  sender?: User;
  receiver_name: string;
  receiver_phone: string;
  receiver_city: string;
  receiver_address: string;
  pickup_city: string;
  destination_city: string;
  weight: number;
  dimensions: string;
  description: string;
  photos: string;
  status: ParcelStatus;
  estimated_price: number;
  insurance: number;
  otp_code: string;
  created_at: string;
  // Aliases for camelCase access used in some components
  trackingCode?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverCity?: string;
  receiverAddress?: string;
  pickupCity?: string;
  pickupAddress?: string;
  estimatedPrice?: number;
  insuranceEnabled?: boolean;
  insuranceAmount?: number;
  otp?: string;
  createdAt?: string;
  updatedAt?: string;
  traveler?: User;
  agent?: User;
}

export type TripStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  traveler_id: string;
  source_city: string;
  destination_city: string;
  travel_date: string;
  capacity: number;
  available_capacity: number;
  status: TripStatus;
  traveler_name?: string;
  // Aliases for camelCase access
  travelerId?: string;
  fromCity?: string;
  toCity?: string;
  departureDate?: string;
  availableCapacity?: number;
  pricePerKg?: number;
  pickupCity?: string;
  receiverCity?: string;
  weight?: number;
  description?: string;
  estimatedPrice?: number;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'COMMISSION' | 'REWARD' | 'PAYOUT';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  // Aliases
  userId?: string;
  createdAt?: string;
  referenceId?: string;
  date?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: number;
  created_at: string;
  // Aliases
  userId?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
