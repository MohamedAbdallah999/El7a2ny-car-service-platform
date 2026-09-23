import "dotenv/config";

import { unlink } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { prisma } from "../src/config/database.js";

const baseUrl = "http://127.0.0.1:4000/api";
const verificationMarker = "ADMIN_E2E_VERIFICATION";

async function api<T>(
  route: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;
  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${route}: ${response.status} ${text}`,
    );
  }
  return body as T;
}

async function login(email: string, password: string): Promise<string> {
  const result = await api<
    | { token: string }
    | {
        requiresTwoFactor: true;
        challengeToken: string;
        developmentVerificationCode?: string;
      }
  >("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if ("token" in result) return result.token;
  const verified = await api<{ token: string }>("/auth/login/verify", {
    method: "POST",
    body: JSON.stringify({
      challengeToken: result.challengeToken,
      code:
        result.developmentVerificationCode ??
        process.env.LOCAL_EMAIL_VERIFICATION_CODE ??
        "123456",
    }),
  });
  return verified.token;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function removeUploadedFile(fileUrl: string | undefined) {
  if (!fileUrl) return;
  const fileName = path.basename(new URL(fileUrl).pathname);
  await unlink(path.resolve(process.cwd(), "uploads", fileName)).catch(
    () => undefined,
  );
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;
  assert(adminPassword, "SEED_ADMIN_PASSWORD is required");
  assert(customerPassword, "SEED_CUSTOMER_PASSWORD is required");

  const [adminToken, customerToken] = await Promise.all([
    login("admin@el7a2ny.dev", adminPassword),
    login("customer@el7a2ny.dev", customerPassword),
  ]);

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: "admin@el7a2ny.dev" },
    include: {
      admin: { include: { businesses: { include: { branches: true } } } },
    },
  });
  const customerUser = await prisma.user.findUniqueOrThrow({
    where: { email: "customer@el7a2ny.dev" },
    include: {
      customer: { include: { vehicles: true, addresses: true, carts: true } },
    },
  });
  const business = adminUser.admin?.businesses[0];
  const customer = customerUser.customer;
  assert(business, "Seed admin has no business");
  assert(customer, "Seed customer profile is missing");
  const branch =
    business.branches.find((item) => item.isPrimary) ?? business.branches[0];
  assert(branch, "Seed business has no branch");
  const vehicle = customer.vehicles[0];
  const address = customer.addresses[0];
  assert(vehicle, "Seed customer has no vehicle");
  assert(address, "Seed customer has no address");

  const service = await prisma.service.findFirstOrThrow({
    where: {
      businessId: business.id,
      isActive: true,
      isOnlineBooking: true,
      OR: [{ branchId: null }, { branchId: branch.id }],
    },
  });
  const inventory = await prisma.inventory.findFirstOrThrow({
    where: {
      businessId: business.id,
      availableQuantity: { gte: 5 },
      product: { status: "ACTIVE", deletedAt: null },
    },
    include: { product: true },
  });

  const cleanup: {
    bookings: string[];
    requests: string[];
    branchId?: string;
    imageId?: string;
    uploadUrls: string[];
    orderId?: string;
    cartId?: string;
    previousCartId?: string;
    originalCover: string | null;
  } = {
    bookings: [],
    requests: [],
    uploadUrls: [],
    originalCover: business.coverImageUrl,
  };

  try {
    const dashboardBefore = await api<{
      stats: {
        completedToday: number;
        todayRevenue: string;
        pendingRequests: number;
      };
      schedule: Array<{ id: string }>;
    }>("/dashboard/admin", {}, adminToken);

    const ownedBusinessIds = adminUser.admin!.businesses.map((item) => item.id);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const scheduledToday = new Date(
      Date.UTC(
        todayStart.getFullYear(),
        todayStart.getMonth(),
        todayStart.getDate(),
      ),
    );
    const [
      expectedPending,
      expectedCompletedBookings,
      expectedCompletedRequests,
      serviceRevenue,
      requestRevenue,
      orderRevenue,
    ] = await Promise.all([
      prisma.serviceRequest.count({
        where: { businessId: { in: ownedBusinessIds }, status: "PENDING" },
      }),
      prisma.booking.count({
        where: {
          businessId: { in: ownedBusinessIds },
          status: "COMPLETED",
          completedAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.serviceRequest.count({
        where: {
          businessId: { in: ownedBusinessIds },
          status: "COMPLETED",
          completedAt: { gte: todayStart, lt: todayEnd },
          booking: { is: null },
        },
      }),
      prisma.booking.aggregate({
        where: {
          businessId: { in: ownedBusinessIds },
          status: "COMPLETED",
          completedAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { finalPrice: true },
      }),
      prisma.serviceRequest.aggregate({
        where: {
          businessId: { in: ownedBusinessIds },
          status: "COMPLETED",
          completedAt: { gte: todayStart, lt: todayEnd },
          booking: { is: null },
        },
        _sum: { finalPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          businessId: { in: ownedBusinessIds },
          order: {
            status: "COMPLETED",
            completedAt: { gte: todayStart, lt: todayEnd },
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);
    assert.equal(dashboardBefore.stats.pendingRequests, expectedPending);
    assert.equal(
      dashboardBefore.stats.completedToday,
      expectedCompletedBookings + expectedCompletedRequests,
    );
    assert.equal(
      Number(dashboardBefore.stats.todayRevenue),
      Number(serviceRevenue._sum.finalPrice ?? 0) +
        Number(requestRevenue._sum.finalPrice ?? 0) +
        Number(orderRevenue._sum.totalAmount ?? 0),
    );
    const scheduledRows = await prisma.booking.findMany({
      where: { id: { in: dashboardBefore.schedule.map((item) => item.id) } },
    });
    assert(
      scheduledRows.every(
        (item) =>
          item.scheduledDate.getTime() === scheduledToday.getTime() &&
          ["CONFIRMED", "ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(
            item.status,
          ),
      ),
    );

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const bookingResult = await api<{
      booking: { id: string; serviceRequestId: string; estimatedPrice: string };
    }>(
      "/bookings",
      {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          branchId: branch.id,
          serviceId: service.id,
          vehicleId: vehicle.id,
          scheduledDate: isoDate(tomorrow),
          startTime: "10:00",
          customerNotes: "Automated end-to-end verification",
        }),
      },
      customerToken,
    );
    cleanup.bookings.push(bookingResult.booking.id);
    cleanup.requests.push(bookingResult.booking.serviceRequestId);

    const pendingRequest = await prisma.serviceRequest.findUniqueOrThrow({
      where: { id: bookingResult.booking.serviceRequestId },
      include: { booking: true },
    });
    assert.equal(pendingRequest.status, "PENDING");
    assert.equal(pendingRequest.booking?.status, "PENDING");
    await assert.rejects(
      api(
        `/bookings/${bookingResult.booking.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }) },
        adminToken,
      ),
      /400/,
    );

    const pendingList = await api<{ items: Array<{ id: string }> }>(
      "/service-requests/business?status=PENDING&limit=100",
      {},
      adminToken,
    );
    assert(pendingList.items.some((item) => item.id === pendingRequest.id));

    await api(
      `/service-requests/${pendingRequest.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ priority: "HIGH", title: "Verified request" }),
      },
      adminToken,
    );
    assert.equal(
      (
        await prisma.serviceRequest.findUniqueOrThrow({
          where: { id: pendingRequest.id },
        })
      ).priority,
      "HIGH",
    );
    const dashboardWithPending = await api<{
      pendingRequests: Array<{ id: string; status: string }>;
    }>("/dashboard/admin", {}, adminToken);
    assert(
      dashboardWithPending.pendingRequests.some(
        (item) => item.id === pendingRequest.id && item.status === "PENDING",
      ),
    );

    await api(
      `/service-requests/${pendingRequest.id}/accept`,
      { method: "POST" },
      adminToken,
    );
    const accepted = await prisma.serviceRequest.findUniqueOrThrow({
      where: { id: pendingRequest.id },
      include: { booking: true },
    });
    assert.equal(accepted.status, "APPROVED");
    assert.equal(accepted.booking?.status, "CONFIRMED");
    const dashboardAfterAccept = await api<{
      pendingRequests: Array<{ id: string }>;
    }>("/dashboard/admin", {}, adminToken);
    assert(
      !dashboardAfterAccept.pendingRequests.some(
        (item) => item.id === pendingRequest.id,
      ),
    );
    await assert.rejects(
      api(
        `/bookings/${bookingResult.booking.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) },
        adminToken,
      ),
      /400/,
    );

    const bookingList = await api<{ items: Array<{ id: string }> }>(
      `/bookings/business?date=${isoDate(tomorrow)}&limit=100`,
      {},
      adminToken,
    );
    assert(
      bookingList.items.some((item) => item.id === bookingResult.booking.id),
    );

    await api(
      `/bookings/${bookingResult.booking.id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }) },
      adminToken,
    );
    assert.equal(
      (
        await prisma.serviceRequest.findUniqueOrThrow({
          where: { id: pendingRequest.id },
        })
      ).status,
      "IN_PROGRESS",
    );
    await api(
      `/bookings/${bookingResult.booking.id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) },
      adminToken,
    );
    const completedBooking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingResult.booking.id },
    });
    assert.equal(completedBooking.status, "COMPLETED");
    assert(completedBooking.completedAt);
    assert.equal(
      (
        await prisma.serviceRequest.findUniqueOrThrow({
          where: { id: pendingRequest.id },
        })
      ).status,
      "COMPLETED",
    );
    await assert.rejects(
      api(
        `/bookings/${bookingResult.booking.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) },
        adminToken,
      ),
      /400/,
    );

    const dashboardAfterBooking = await api<{
      stats: {
        completedToday: number;
        todayRevenue: string;
        pendingRequests: number;
      };
    }>("/dashboard/admin", {}, adminToken);
    assert.equal(
      dashboardAfterBooking.stats.completedToday,
      dashboardBefore.stats.completedToday + 1,
    );
    assert.equal(
      Number(dashboardAfterBooking.stats.todayRevenue),
      Number(dashboardBefore.stats.todayRevenue) +
        Number(bookingResult.booking.estimatedPrice),
    );

    const rejectedResult = await api<{
      booking: { id: string; serviceRequestId: string };
    }>(
      "/bookings",
      {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          branchId: branch.id,
          serviceId: service.id,
          vehicleId: vehicle.id,
          scheduledDate: isoDate(tomorrow),
          startTime: "12:00",
        }),
      },
      customerToken,
    );
    cleanup.bookings.push(rejectedResult.booking.id);
    cleanup.requests.push(rejectedResult.booking.serviceRequestId);
    await api(
      `/service-requests/${rejectedResult.booking.serviceRequestId}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "REJECTED" }) },
      adminToken,
    );
    const rejected = await prisma.booking.findUniqueOrThrow({
      where: { id: rejectedResult.booking.id },
      include: { serviceRequest: true },
    });
    assert.equal(rejected.status, "REJECTED");
    assert.equal(rejected.serviceRequest?.status, "REJECTED");

    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=";
    const businessUpload = await api<{ fileUrl: string }>(
      "/uploads",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: "business.png",
          mimeType: "image/png",
          data: png,
          purpose: "BUSINESS_IMAGE",
        }),
      },
      adminToken,
    );
    cleanup.uploadUrls.push(businessUpload.fileUrl);
    await api(
      `/businesses/${business.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ coverImageUrl: businessUpload.fileUrl }),
      },
      adminToken,
    );
    assert.equal(
      (await prisma.business.findUniqueOrThrow({ where: { id: business.id } }))
        .coverImageUrl,
      businessUpload.fileUrl,
    );
    assert.equal((await fetch(businessUpload.fileUrl)).status, 200);
    assert.equal(
      (
        await api<{ business: { coverImageUrl: string } }>(
          `/businesses/${business.id}`,
          {},
          adminToken,
        )
      ).business.coverImageUrl,
      businessUpload.fileUrl,
    );

    const createdBranch = await api<{ branch: { id: string } }>(
      `/businesses/${business.id}/branches`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "E2E Branch",
          addressLine1: "1 Test Street",
          city: "Cairo",
          country: "Egypt",
        }),
      },
      adminToken,
    );
    cleanup.branchId = createdBranch.branch.id;
    await api(
      `/businesses/${business.id}/branches/${createdBranch.branch.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ addressLine1: "2 Verified Street" }),
      },
      adminToken,
    );
    assert.equal(
      (
        await prisma.businessBranch.findUniqueOrThrow({
          where: { id: createdBranch.branch.id },
        })
      ).addressLine1,
      "2 Verified Street",
    );
    assert(
      (
        await api<{ branches: Array<{ id: string; addressLine1: string }> }>(
          `/businesses/${business.id}/branches`,
        )
      ).branches.some(
        (item) =>
          item.id === createdBranch.branch.id &&
          item.addressLine1 === "2 Verified Street",
      ),
    );

    const productUpload = await api<{ fileUrl: string }>(
      "/uploads",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: "product.png",
          mimeType: "image/png",
          data: png,
          purpose: "PRODUCT_IMAGE",
        }),
      },
      adminToken,
    );
    cleanup.uploadUrls.push(productUpload.fileUrl);
    const productImage = await api<{ image: { id: string } }>(
      `/catalog/products/${inventory.productId}/images`,
      {
        method: "POST",
        body: JSON.stringify({
          imageUrl: productUpload.fileUrl,
          altText: "E2E product",
          isPrimary: true,
        }),
      },
      adminToken,
    );
    cleanup.imageId = productImage.image.id;
    assert(
      (
        await prisma.product.findUniqueOrThrow({
          where: { id: inventory.productId },
          include: { images: true },
        })
      ).images.some((image) => image.id === productImage.image.id),
    );
    assert.equal((await fetch(productUpload.fileUrl)).status, 200);
    assert(
      (
        await api<{ product: { images: Array<{ id: string }> } }>(
          `/catalog/products/${inventory.productId}`,
        )
      ).product.images.some((image) => image.id === productImage.image.id),
    );

    const beforeManualStock = (
      await prisma.inventory.findUniqueOrThrow({ where: { id: inventory.id } })
    ).quantity;
    await api(
      `/catalog/inventory/${inventory.id}/adjust`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "PURCHASE",
          quantity: 5,
          notes: verificationMarker,
        }),
      },
      adminToken,
    );
    assert.equal(
      (
        await prisma.inventory.findUniqueOrThrow({
          where: { id: inventory.id },
        })
      ).quantity,
      beforeManualStock + 5,
    );
    await api(
      `/catalog/inventory/${inventory.id}/adjust`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "ADJUSTMENT",
          quantity: -5,
          notes: verificationMarker,
        }),
      },
      adminToken,
    );

    const activeCart = await prisma.cart.findFirst({
      where: { customerId: customer.id, status: "ACTIVE" },
    });
    if (activeCart) {
      cleanup.previousCartId = activeCart.id;
      await prisma.cart.update({
        where: { id: activeCart.id },
        data: { status: "ABANDONED" },
      });
    }
    const testCart = await prisma.cart.create({
      data: {
        customerId: customer.id,
        status: "ACTIVE",
        items: {
          create: {
            productId: inventory.productId,
            quantity: 2,
            unitPrice: inventory.product.price,
          },
        },
      },
    });
    cleanup.cartId = testCart.id;
    const stockBeforeOrder = (
      await prisma.inventory.findUniqueOrThrow({ where: { id: inventory.id } })
    ).quantity;
    const checkedOut = await api<{ order: { id: string } }>(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify({ shippingAddressId: address.id }),
      },
      customerToken,
    );
    cleanup.orderId = checkedOut.order.id;
    await api(
      `/orders/${checkedOut.order.id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "CONFIRMED" }) },
      adminToken,
    );
    assert.equal(
      (
        await prisma.inventory.findUniqueOrThrow({
          where: { id: inventory.id },
        })
      ).quantity,
      stockBeforeOrder - 2,
    );
    for (const status of ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"]) {
      await api(
        `/orders/${checkedOut.order.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        adminToken,
      );
    }
    const dashboardAfterOrder = await api<{ stats: { todayRevenue: string } }>(
      "/dashboard/admin",
      {},
      adminToken,
    );
    assert(
      Number(dashboardAfterOrder.stats.todayRevenue) >
        Number(dashboardAfterBooking.stats.todayRevenue),
    );
    await api(
      `/orders/${checkedOut.order.id}/return`,
      { method: "POST" },
      adminToken,
    );
    await assert.rejects(
      api(
        `/orders/${checkedOut.order.id}/return`,
        { method: "POST" },
        adminToken,
      ),
      /400|409/,
    );
    assert.equal(
      (
        await prisma.inventory.findUniqueOrThrow({
          where: { id: inventory.id },
        })
      ).quantity,
      stockBeforeOrder,
    );
    assert.equal(
      (
        await prisma.order.findUniqueOrThrow({
          where: { id: checkedOut.order.id },
        })
      ).status,
      "REFUNDED",
    );

    const customerList = await api<{
      customers: Array<{
        id: string;
        vehicleCount: number;
        bookingCount: number;
        orderCount: number;
      }>;
    }>(`/dashboard/admin/customers?businessId=${business.id}`, {}, adminToken);
    const listedCustomer = customerList.customers.find(
      (item) => item.id === customer.id,
    );
    assert(
      listedCustomer,
      "Customer is missing from the business customer list",
    );
    const [expectedBookings, expectedOrders] = await Promise.all([
      prisma.booking.count({
        where: { customerId: customer.id, businessId: business.id },
      }),
      prisma.order.count({
        where: {
          customerId: customer.id,
          items: { some: { businessId: business.id } },
        },
      }),
    ]);
    assert.equal(listedCustomer.vehicleCount, customer.vehicles.length);
    assert.equal(listedCustomer.bookingCount, expectedBookings);
    assert.equal(listedCustomer.orderCount, expectedOrders);

    const customerDetails = await api<{
      customer: {
        id: string;
        vehicles: Array<{ id: string }>;
        bookings: Array<{
          id: string;
          business: { id: string };
        }>;
        orders: Array<{
          id: string;
          items: Array<{ business: { id: string } }>;
        }>;
      };
    }>(
      `/dashboard/admin/customers/${customer.id}?businessId=${business.id}`,
      {},
      adminToken,
    );
    assert.equal(customerDetails.customer.id, customer.id);
    assert.equal(
      customerDetails.customer.vehicles.length,
      customer.vehicles.length,
    );
    assert(
      customerDetails.customer.bookings.every(
        (item) => item.business.id === business.id,
      ),
    );
    assert(
      customerDetails.customer.orders.every((order) =>
        order.items.every((item) => item.business.id === business.id),
      ),
    );
    assert(
      customerDetails.customer.bookings.some(
        (item) => item.id === completedBooking.id,
      ),
    );
    assert(
      customerDetails.customer.orders.some(
        (item) => item.id === checkedOut.order.id,
      ),
    );
    const foreignBusiness = await prisma.business.findFirst({
      where: { id: { notIn: ownedBusinessIds }, deletedAt: null },
      select: { id: true },
    });
    if (foreignBusiness) {
      await assert.rejects(
        api(
          `/dashboard/admin/customers/${customer.id}?businessId=${foreignBusiness.id}`,
          {},
          adminToken,
        ),
        /403/,
      );
    }
    const serializedCustomer = JSON.stringify(customerDetails.customer);
    for (const privateField of [
      "passwordHash",
      "dateOfBirth",
      "gender",
      "marketingConsent",
      "preferredLanguage",
      "preferredCurrency",
      "addresses",
      "sessions",
      "verificationTokens",
      "vin",
      "shippingAddress",
      "shippingAddressSnapshot",
    ]) {
      assert(
        !serializedCustomer.includes(`"${privateField}"`),
        `Private field leaked: ${privateField}`,
      );
    }
    await assert.rejects(
      api(
        `/dashboard/admin/customers/not-a-uuid?businessId=${business.id}`,
        {},
        adminToken,
      ),
      /400/,
    );

    console.log(
      JSON.stringify(
        {
          bookingRequest: "passed",
          requestEditAcceptReject: "passed",
          bookingStartComplete: "passed",
          dashboardCompletionRevenue: "passed",
          businessImage: "passed",
          branchCreateEdit: "passed",
          productImage: "passed",
          inventoryRestock: "passed",
          orderDecreaseReturn: "passed",
          customerBusinessScopedDetails: "passed",
          customerPrivateFieldsExcluded: "passed",
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.inventoryMovement.deleteMany({
      where: { notes: verificationMarker },
    });
    if (cleanup.orderId) {
      const itemIds = (
        await prisma.orderItem.findMany({
          where: { orderId: cleanup.orderId },
          select: { id: true },
        })
      ).map((item) => item.id);
      await prisma.inventoryMovement.deleteMany({
        where: { referenceType: "ORDER_ITEM", referenceId: { in: itemIds } },
      });
      await prisma.order.deleteMany({ where: { id: cleanup.orderId } });
    }
    if (cleanup.cartId) {
      await prisma.cart.deleteMany({ where: { id: cleanup.cartId } });
    }
    if (cleanup.previousCartId) {
      await prisma.cart.updateMany({
        where: { id: cleanup.previousCartId },
        data: { status: "ACTIVE" },
      });
    }
    if (cleanup.imageId) {
      await prisma.productImage.deleteMany({ where: { id: cleanup.imageId } });
    }
    await prisma.business.update({
      where: { id: business.id },
      data: { coverImageUrl: cleanup.originalCover },
    });
    if (cleanup.branchId) {
      await prisma.businessBranch.deleteMany({
        where: { id: cleanup.branchId },
      });
    }
    for (const bookingId of cleanup.bookings) {
      await prisma.booking.deleteMany({ where: { id: bookingId } });
    }
    for (const requestId of cleanup.requests) {
      await prisma.serviceRequest.deleteMany({ where: { id: requestId } });
    }
    for (const url of cleanup.uploadUrls) await removeUploadedFile(url);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
