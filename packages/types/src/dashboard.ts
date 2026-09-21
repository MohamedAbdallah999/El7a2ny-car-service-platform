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
