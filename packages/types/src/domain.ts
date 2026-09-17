import type {
  BookingStatus,
  BusinessType,
  FuelType,
  OrderStatus,
  ServiceRequestStatus,
  TransmissionType,
  VerificationStatus,
} from "@car-platform/constants";

// Lean, UI-facing shapes for the backend's JSON responses — not a 1:1 mirror
// of every Prisma column, just what the frontends actually render. Backend
// responses may include more fields than these interfaces declare; extend
// here as a screen needs something new.

export interface BusinessBranchSummary {
  id: string;
  name: string;
  city: string;
  addressLine1: string;
  isPrimary: boolean;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface BusinessSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  businessType: BusinessType;
  status: string;
  verificationStatus: VerificationStatus;
  averageRating: string;
  totalReviews: number;
  branches?: BusinessBranchSummary[];
}

export interface ServiceSummary {
  id: string;
  businessId: string;
  branchId: string | null;
  categoryId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  basePrice: string;
  currency: string;
  isOnlineBooking: boolean;
  isActive: boolean;
  business?: BusinessSummary;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  imageUrl: string | null;
  parentId: string | null;
}

export interface VehicleMake {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
}

export interface Vehicle {
  id: string;
  makeId: string;
  modelId: string;
  year: number;
  trim: string | null;
  color: string | null;
  licensePlate: string | null;
  mileage: number | null;
  fuelType: FuelType | null;
  transmission: TransmissionType | null;
  nickname: string | null;
  imageUrl: string | null;
  isPrimary: boolean;
  make?: VehicleMake;
  model?: VehicleModel;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  businessId: string;
  branchId: string;
  vehicleId: string;
  serviceId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  estimatedPrice: string;
  finalPrice: string | null;
  currency: string;
  customerNotes: string | null;
  business?: BusinessSummary;
  branch?: BusinessBranchSummary;
  service?: ServiceSummary;
  vehicle?: Vehicle;
}

export interface ServiceRequestSummary {
  id: string;
  requestNumber: string;
  title: string;
  description: string | null;
  status: ServiceRequestStatus;
  priority: string;
  estimatedPrice: string | null;
  finalPrice: string | null;
  createdAt: string;
  business?: BusinessSummary;
  vehicle?: Vehicle;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  status: string;
  isFeatured: boolean;
  images?: ProductImage[];
  category?: ProductCategory;
  business?: BusinessSummary;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
}

export interface CartSummary {
  cart: Cart;
  subtotal: number;
  itemCount: number;
}

export interface CustomerAddress {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  businessId: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  shippingAmount: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}
