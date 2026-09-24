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
  addressLine2?: string | null;
  isPrimary: boolean;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
  email?: string | null;
  state?: string | null;
  country?: string;
  postalCode?: string | null;
  status?: string;
  hours?: BusinessHour[];
}

export interface BusinessHour {
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  isClosed: boolean;
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
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
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
  category?: ServiceCategory;
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
  customerId: string;
  businessId: string;
  branchId: string;
  vehicleId: string;
  serviceId: string;
  serviceRequestId: string | null;
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
  customer?: {
    user?: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string | null;
    };
  };
}

export interface ServiceRequestSummary {
  id: string;
  customerId: string;
  vehicleId: string;
  businessId: string | null;
  branchId: string | null;
  serviceId: string | null;
  requestNumber: string;
  title: string;
  description: string | null;
  status: ServiceRequestStatus;
  priority: string;
  estimatedPrice: string | null;
  finalPrice: string | null;
  createdAt: string;
  business?: BusinessSummary;
  service?: ServiceSummary | null;
  vehicle?: Vehicle;
  customer?: {
    user?: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string | null;
    };
  };
  booking?: Booking | null;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductVehicleCompatibility {
  id: string;
  productId: string;
  makeId: string | null;
  modelId: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  engine: string | null;
  notes: string | null;
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
  costPrice?: string | null;
  currency: string;
  status: string;
  isFeatured: boolean;
  images?: ProductImage[];
  category?: ProductCategory;
  business?: BusinessSummary;
  vehicleCompatibilities?: ProductVehicleCompatibility[];
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
  business?: BusinessSummary;
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
