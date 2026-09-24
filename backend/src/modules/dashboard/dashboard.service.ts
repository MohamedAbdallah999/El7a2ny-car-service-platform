import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

const fullName = (user: { firstName: string; lastName: string }): string =>
  `${user.firstName} ${user.lastName}`.trim();

const vehicleName = (vehicle: {
  year: number;
  make: { name: string };
  model: { name: string };
}): string => `${vehicle.make.name} ${vehicle.model.name} ${vehicle.year}`;

const timeLabel = (value: Date): string => value.toISOString().slice(11, 16);

async function getAdminBusinessIds(
  userId: string,
  requestedBusinessId?: string,
): Promise<string[]> {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: {
      businesses: { where: { deletedAt: null }, select: { id: true } },
    },
  });
  if (!admin) {
    throw new AppError(403, "Only admin accounts can view customers");
  }
  const businessIds = admin.businesses.map(({ id }) => id);
  if (requestedBusinessId) {
    if (!businessIds.includes(requestedBusinessId)) {
      throw new AppError(403, "You cannot view customers for this business");
    }
    return [requestedBusinessId];
  }
  return businessIds;
}

const customerRelationshipWhere = (
  businessIds: string[],
): Prisma.CustomerWhereInput => ({
  OR: [
    { bookings: { some: { businessId: { in: businessIds } } } },
    { serviceRequests: { some: { businessId: { in: businessIds } } } },
    {
      orders: {
        some: { items: { some: { businessId: { in: businessIds } } } },
      },
    },
  ],
});

export const dashboardService = {
  async getAdminCustomers(userId: string, businessId?: string) {
    const businessIds = await getAdminBusinessIds(userId, businessId);
    if (businessIds.length === 0) return [];
    const customers = await prisma.customer.findMany({
      where: customerRelationshipWhere(businessIds),
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        vehicles: {
          select: {
            id: true,
            year: true,
            make: { select: { name: true } },
            model: { select: { name: true } },
          },
        },
        bookings: {
          where: {
            businessId: { in: businessIds },
          },
          select: { status: true, scheduledDate: true, completedAt: true },
        },
        orders: {
          where: {
            items: { some: { businessId: { in: businessIds } } },
          },
          select: { id: true },
        },
      },
    });
    return customers.map((customer) => ({
      id: customer.id,
      name: fullName(customer.user),
      email: customer.user.email,
      phone: customer.user.phone,
      status: customer.user.status,
      vehicleCount: customer.vehicles.length,
      vehicles: customer.vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.make.name} ${vehicle.model.name} ${vehicle.year}`,
      })),
      bookingCount: customer.bookings.length,
      orderCount: customer.orders.length,
      lastVisit:
        customer.bookings
          .filter((booking) => booking.status === "COMPLETED")
          .reduce<Date | null>(
            (latest, booking) =>
              !latest || (booking.completedAt ?? booking.scheduledDate) > latest
                ? (booking.completedAt ?? booking.scheduledDate)
                : latest,
            null,
          )
          ?.toISOString() ?? null,
    }));
  },
  async getAdminCustomer(
    userId: string,
    customerId: string,
    businessId?: string,
  ) {
    const businessIds = await getAdminBusinessIds(userId, businessId);
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        ...customerRelationshipWhere(businessIds),
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImageUrl: true,
            status: true,
          },
        },
        vehicles: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            year: true,
            trim: true,
            color: true,
            licensePlate: true,
            mileage: true,
            fuelType: true,
            transmission: true,
            nickname: true,
            imageUrl: true,
            isPrimary: true,
            make: { select: { name: true } },
            model: { select: { name: true } },
          },
        },
        bookings: {
          where: { businessId: { in: businessIds } },
          orderBy: [{ scheduledDate: "desc" }, { startTime: "desc" }],
          select: {
            id: true,
            bookingNumber: true,
            scheduledDate: true,
            startTime: true,
            endTime: true,
            status: true,
            estimatedPrice: true,
            finalPrice: true,
            currency: true,
            customerNotes: true,
            businessNotes: true,
            createdAt: true,
            confirmedAt: true,
            completedAt: true,
            cancelledAt: true,
            cancellationReason: true,
            business: { select: { id: true, name: true } },
            branch: {
              select: { id: true, name: true, addressLine1: true, city: true },
            },
            service: {
              select: { id: true, name: true, durationMinutes: true },
            },
            vehicle: {
              select: {
                id: true,
                year: true,
                make: { select: { name: true } },
                model: { select: { name: true } },
              },
            },
          },
        },
        orders: {
          where: { items: { some: { businessId: { in: businessIds } } } },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
            cancelledAt: true,
            completedAt: true,
            items: {
              where: { businessId: { in: businessIds } },
              select: {
                id: true,
                productId: true,
                productNameSnapshot: true,
                skuSnapshot: true,
                quantity: true,
                unitPrice: true,
                discountAmount: true,
                totalAmount: true,
                business: { select: { id: true, name: true } },
              },
            },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { status: true, paidAt: true },
            },
            shipments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                status: true,
                carrier: true,
                trackingNumber: true,
                shippedAt: true,
                deliveredAt: true,
              },
            },
          },
        },
      },
    });
    if (!customer) {
      throw new AppError(404, "Customer not found for this business");
    }

    return {
      id: customer.id,
      name: fullName(customer.user),
      email: customer.user.email,
      phone: customer.user.phone,
      profileImageUrl: customer.user.profileImageUrl,
      status: customer.user.status,
      customerSince: customer.createdAt.toISOString(),
      vehicles: customer.vehicles.map((vehicle) => ({
        id: vehicle.id,
        make: vehicle.make.name,
        model: vehicle.model.name,
        year: vehicle.year,
        trim: vehicle.trim,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        nickname: vehicle.nickname,
        imageUrl: vehicle.imageUrl,
        isPrimary: vehicle.isPrimary,
      })),
      bookings: customer.bookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        scheduledDate: booking.scheduledDate.toISOString(),
        startTime: timeLabel(booking.startTime),
        endTime: timeLabel(booking.endTime),
        status: booking.status,
        estimatedPrice: booking.estimatedPrice.toString(),
        finalPrice: booking.finalPrice?.toString() ?? null,
        currency: booking.currency,
        customerNotes: booking.customerNotes,
        businessNotes: booking.businessNotes,
        createdAt: booking.createdAt.toISOString(),
        confirmedAt: booking.confirmedAt?.toISOString() ?? null,
        completedAt: booking.completedAt?.toISOString() ?? null,
        cancelledAt: booking.cancelledAt?.toISOString() ?? null,
        cancellationReason: booking.cancellationReason,
        business: booking.business,
        branch: booking.branch,
        service: booking.service,
        vehicle: {
          id: booking.vehicle.id,
          label: vehicleName(booking.vehicle),
        },
      })),
      orders: customer.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,
        total: order.items
          .reduce((sum, item) => sum + Number(item.totalAmount), 0)
          .toFixed(2),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        completedAt: order.completedAt?.toISOString() ?? null,
        cancelledAt: order.cancelledAt?.toISOString() ?? null,
        paymentStatus: order.payments[0]?.status ?? "PENDING",
        paidAt: order.payments[0]?.paidAt?.toISOString() ?? null,
        shipment: order.shipments[0]
          ? {
              ...order.shipments[0],
              shippedAt: order.shipments[0].shippedAt?.toISOString() ?? null,
              deliveredAt:
                order.shipments[0].deliveredAt?.toISOString() ?? null,
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productNameSnapshot,
          sku: item.skuSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          discountAmount: item.discountAmount.toString(),
          totalAmount: item.totalAmount.toString(),
          business: item.business,
        })),
      })),
    };
  },
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
    const scheduledToday = new Date(
      Date.UTC(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()),
    );

    if (businessIds.length === 0) {
      return {
        business: null,
        stats: {
          todayBookings: 0,
          inProgressBookings: 0,
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

    const bookingTodayWhere: Prisma.BookingWhereInput = {
      businessId: { in: businessIds },
      scheduledDate: scheduledToday,
      status: { in: ["CONFIRMED", "ARRIVED", "IN_PROGRESS", "COMPLETED"] },
    };

    const [
      schedule,
      pendingRequests,
      orderItems,
      inventoryAlerts,
      todayBookings,
      inProgressBookings,
      completedRequestsToday,
      completedBookingsToday,
      todayOrders,
      activeServices,
      pendingRequestCount,
      bookingRevenue,
      requestRevenue,
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
        where: {
          businessId: { in: businessIds },
          scheduledDate: scheduledToday,
          status: "IN_PROGRESS",
        },
      }),
      prisma.serviceRequest.count({
        where: {
          businessId: { in: businessIds },
          status: "COMPLETED",
          completedAt: { gte: dayStart, lt: dayEnd },
          booking: { is: null },
        },
      }),
      prisma.booking.count({
        where: {
          businessId: { in: businessIds },
          status: "COMPLETED",
          completedAt: { gte: dayStart, lt: dayEnd },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          items: { some: { businessId: { in: businessIds } } },
        },
      }),
      prisma.service.count({
        where: {
          businessId: { in: businessIds },
          isActive: true,
          deletedAt: null,
        },
      }),
      prisma.serviceRequest.count({
        where: { businessId: { in: businessIds }, status: "PENDING" },
      }),
      prisma.booking.aggregate({
        where: {
          businessId: { in: businessIds },
          status: "COMPLETED",
          completedAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { finalPrice: true },
      }),
      prisma.serviceRequest.aggregate({
        where: {
          businessId: { in: businessIds },
          status: "COMPLETED",
          completedAt: { gte: dayStart, lt: dayEnd },
          booking: { is: null },
        },
        _sum: { finalPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          businessId: { in: businessIds },
          order: {
            status: "COMPLETED",
            completedAt: { gte: dayStart, lt: dayEnd },
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
        inProgressBookings,
        completedToday: completedBookingsToday + completedRequestsToday,
        todayOrders,
        pendingRequests: pendingRequestCount,
        activeServices,
        todayRevenue: (
          Number(bookingRevenue._sum.finalPrice ?? 0) +
          Number(requestRevenue._sum.finalPrice ?? 0) +
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
