export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type GearStatus = "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "CANCELLED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorDetails?: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  _count?: { gearItems: number };
}

export interface GearItem {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  brand: string;
  description: string;
  pricePerDay: string | number;
  stock: number;
  specifications?: Record<string, unknown> | null;
  status: GearStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category?: Category | { id: string; name: string; slug: string };
  provider?: { id: string; name: string; email?: string };
  _count?: { reviews: number };
  reviews?: Review[];
}

export interface RentalOrderItem {
  id: string;
  rentalOrderId: string;
  gearItemId: string;
  quantity: number;
  pricePerDay: string | number;
  gearItem?: GearItem;
}

export interface Payment {
  id: string;
  rentalOrderId: string;
  customerId: string;
  amount: string | number;
  provider: "STRIPE" | "SSLCOMMERZ";
  stripePaymentIntentId?: string | null;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  rentalOrder?: RentalOrder;
}

export interface Review {
  id: string;
  customerId: string;
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: { id: string; name: string };
  gearItem?: { id: string; name: string };
}

export interface RentalOrder {
  id: string;
  customerId: string;
  providerId: string;
  startDate: string;
  endDate: string;
  totalAmount: string | number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
  items?: RentalOrderItem[];
  payment?: Payment | null;
  review?: Review | null;
  customer?: { id: string; name: string; email?: string };
  provider?: { id: string; name: string };
}

export interface AuthPayload {
  user: User;
  token: string;
}
