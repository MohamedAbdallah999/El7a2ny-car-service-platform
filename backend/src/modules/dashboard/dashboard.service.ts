import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";

const fullName = (user: { firstName: string; lastName: string }): string =>
  `${user.firstName} ${user.lastName}`.trim();

const vehicleName = (vehicle: {
  year: number;
  make: { name: string };
  model: { name: string };
}): string => `${vehicle.make.name} ${vehicle.model.name} ${vehicle.year}`;

const timeLabel = (value: Date): string => value.toISOString().slice(11, 16);

export const dashboardService = {
  async getAdminOverview(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { userId },
      include: {
        businesses: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: {
            branches: {
              where: { status: "ACTIVE" },
              orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        },
      },
    });

    if (!admin) {
      throw new AppError(403, "Only admin accounts can view this dashboard");
    }

    const businessIds = admin.businesses.map((business) => business.id);
    const primaryBusiness = admin.businesses[0] ?? null;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    if (businessIds.length === 0) {
      return {
        business: null,
        stats: {
          todayBookings: 0,
          completedToday: 0,
          todayOrders: 0,
          pendingRequests: 0,
          activeServices: 0,
          todayRevenue: "0.00",
          currency: "EGP",
          totalCustomers: 0,
          newReviews: 0,
        },
        schedule: [],
        pendingRequests: [],
        recentOrders: [],
        inventoryAlerts: [],
      };
    }

    const bookingTodayWhere = {
      businessId: { in: businessIds },
      scheduledDate: { gte: dayStart, lt: dayEnd },
    } as const;

    const [
      schedule,
      pendingRequests,
      orderItems,
      inventoryAlerts,
      todayBookings,
      completedToday,
      todayOrders,
      activeServices,
      pendingRequestCount,
      bookingRevenue,
      orderRevenue,
      bookingCustomers,
      requestCustomers,
      orderCustomers,
      newReviews,
    ] = await Promise.all([
      prisma.booking.findMany({
        where: bookingTodayWhere,
        orderBy: { startTime: "asc" },
        take: 8,
        include: {
          customer: { include: { user: true } },
          vehicle: { include: { make: true, model: true } },
          service: true,
        },
      }),
      prisma.serviceRequest.findMany({
        where: { businessId: { in: businessIds }, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { include: { user: true } },
          vehicle: { include: { make: true, model: true } },
        },
      }),
      prisma.orderItem.findMany({
        where: { businessId: { in: businessIds } },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          order: {
            include: {
              customer: { include: { user: true } },
              payments: { orderBy: { createdAt: "desc" }, take: 1 },
              shipments: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
      }),
      prisma.inventory.findMany({
        where: {
          businessId: { in: businessIds },
          availableQuantity: { lte: prisma.inventory.fields.lowStockThreshold },
        },
        orderBy: { availableQuantity: "asc" },
        take: 5,
        include: { product: true },
      }),
      prisma.booking.count({ where: bookingTodayWhere }),
      prisma.booking.count({
        where: { ...bookingTodayWhere, status: "COMPLETED" },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          items: { some: { businessId: { in: businessIds } } },
        },
      }),
      prisma.booking.count({
        where: { ...bookingTodayWhere, status: "IN_PROGRESS" },
      }),
      prisma.serviceRequest.count({
        where: { businessId: { in: businessIds }, status: "PENDING" },
      }),
      prisma.booking.aggregate({
        where: { ...bookingTodayWhere, status: "COMPLETED" },
        _sum: { finalPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          businessId: { in: businessIds },
          order: {
            createdAt: { gte: dayStart, lt: dayEnd },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.findMany({
        where: { businessId: { in: businessIds } },
        distinct: ["customerId"],
        select: { customerId: true },
      }),
      prisma.serviceRequest.findMany({
        where: { businessId: { in: businessIds } },
        distinct: ["customerId"],
        select: { customerId: true },
      }),
      prisma.order.findMany({
        where: { items: { some: { businessId: { in: businessIds } } } },
        distinct: ["customerId"],
        select: { customerId: true },
      }),
      prisma.businessReview.count({
        where: { businessId: { in: businessIds }, status: "PENDING" },
      }),
    ]);

    const customerIds = new Set([
      ...bookingCustomers.map(({ customerId }) => customerId),
      ...requestCustomers.map(({ customerId }) => customerId),
      ...orderCustomers.map(({ customerId }) => customerId),
    ]);
    const orders = new Map<string, (typeof orderItems)[number][]>();
    for (const item of orderItems) {
      const current = orders.get(item.orderId) ?? [];
      current.push(item);
      orders.set(item.orderId, current);
    }

    return {
      business: primaryBusiness
        ? {
            id: primaryBusiness.id,
            name: primaryBusiness.name,
            verificationStatus: primaryBusiness.verificationStatus,
            averageRating: primaryBusiness.averageRating.toString(),
            totalReviews: primaryBusiness.totalReviews,
            city: primaryBusiness.branches[0]?.city ?? null,
          }
        : null,
      stats: {
        todayBookings,
        completedToday,
        todayOrders,
        pendingRequests: pendingRequestCount,
        activeServices,
        todayRevenue: (
          Number(bookingRevenue._sum.finalPrice ?? 0) +
          Number(orderRevenue._sum.totalAmount ?? 0)
        ).toFixed(2),
        currency: "EGP",
        totalCustomers: customerIds.size,
        newReviews,
      },
      schedule: schedule.map((booking) => ({
        id: booking.id,
        time: timeLabel(booking.startTime),
        customerName: fullName(booking.customer.user),
        vehicleName: vehicleName(booking.vehicle),
        serviceName: booking.service.name,
        status: booking.status,
      })),
      pendingRequests: pendingRequests.map((request) => ({
        id: request.id,
        requestNumber: request.requestNumber,
        customerName: fullName(request.customer.user),
        vehicleName: vehicleName(request.vehicle),
        title: request.title,
        priority: request.priority,
        status: request.status,
      })),
      recentOrders: [...orders.values()].slice(0, 5).map((items) => {
        const first = items[0]!;
        return {
          id: first.order.id,
          orderNumber: first.order.orderNumber,
          customerName: fullName(first.order.customer.user),
          products: items.map((item) => item.productNameSnapshot).join(", "),
          quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          total: items
            .reduce((sum, item) => sum + Number(item.totalAmount), 0)
            .toFixed(2),
          currency: first.order.currency,
          paymentStatus: first.order.payments[0]?.status ?? "PENDING",
          status: first.order.shipments[0]?.status ?? first.order.status,
          createdAt: first.order.createdAt.toISOString(),
        };
      }),
      inventoryAlerts: inventoryAlerts.map((inventory) => ({
        id: inventory.id,
        productName: inventory.product.name,
        availableQuantity: inventory.availableQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        status:
          inventory.availableQuantity === 0
            ? ("OUT_OF_STOCK" as const)
            : ("LOW_STOCK" as const),
      })),
    };
  },
};
