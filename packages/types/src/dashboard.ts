export interface AdminDashboardBusiness {
  id: string;
  name: string;
  verificationStatus: string;
  averageRating: string;
  totalReviews: number;
  city: string | null;
}

export interface AdminDashboardStats {
  todayBookings: number;
  inProgressBookings: number;
  completedToday: number;
  todayOrders: number;
  pendingRequests: number;
  activeServices: number;
  todayRevenue: string;
  currency: string;
  totalCustomers: number;
  newReviews: number;
}

export interface AdminDashboardScheduleItem {
  id: string;
  time: string;
  customerName: string;
  vehicleName: string;
  serviceName: string;
  status: string;
}

export interface AdminDashboardRequestItem {
  id: string;
  requestNumber: string;
  customerName: string;
  vehicleName: string;
  title: string;
  priority: string;
  status: string;
}

export interface AdminDashboardOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  products: string;
  quantity: number;
  total: string;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardInventoryAlert {
  id: string;
  productName: string;
  availableQuantity: number;
  lowStockThreshold: number;
  status: "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface AdminDashboardResponse {
  business: AdminDashboardBusiness | null;
  stats: AdminDashboardStats;
  schedule: AdminDashboardScheduleItem[];
  pendingRequests: AdminDashboardRequestItem[];
  recentOrders: AdminDashboardOrderItem[];
  inventoryAlerts: AdminDashboardInventoryAlert[];
}

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  vehicleCount: number;
  bookingCount: number;
  orderCount: number;
  lastVisit: string | null;
  vehicles: Array<{ id: string; label: string }>;
}

export interface AdminCustomerVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  color: string | null;
  licensePlate: string | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  nickname: string | null;
  imageUrl: string | null;
  isPrimary: boolean;
}

export interface AdminCustomerBooking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  estimatedPrice: string;
  finalPrice: string | null;
  currency: string;
  customerNotes: string | null;
  businessNotes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  business: { id: string; name: string };
  branch: { id: string; name: string; addressLine1: string; city: string };
  service: { id: string; name: string; durationMinutes: number };
  vehicle: { id: string; label: string };
}

export interface AdminCustomerOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  totalAmount: string;
  business: { id: string; name: string };
}

export interface AdminCustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  paymentStatus: string;
  paidAt: string | null;
  shipment: {
    status: string;
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
  items: AdminCustomerOrderItem[];
}

export interface AdminCustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  status: string;
  customerSince: string;
  vehicles: AdminCustomerVehicle[];
  bookings: AdminCustomerBooking[];
  orders: AdminCustomerOrder[];
}
