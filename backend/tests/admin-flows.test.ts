import assert from "node:assert/strict";
import test from "node:test";
import { normalizeInventoryMovementQuantity } from "../src/modules/catalog/catalog.service.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../src/modules/catalog/catalog.validation.js";
import { canTransitionOrderStatus } from "../src/modules/order/order.service.js";
import { rescheduleBookingSchema } from "../src/modules/booking/booking.validation.js";

const id = "00000000-0000-4000-8000-000000000001";

test("product creation accepts initial inventory while product updates do not", () => {
  const created = createProductSchema.safeParse({
    businessId: id,
    categoryId: id,
    sku: "FILTER-1",
    name: "Oil filter",
    price: 125,
    inventory: {
      branchId: id,
      quantity: 10,
      lowStockThreshold: 3,
      reorderQuantity: 3,
    },
  });
  assert.equal(created.success, true);
  assert.equal(
    updateProductSchema.safeParse({ inventory: { branchId: id } }).success,
    false,
  );
});

test("inventory movement types apply the correct stock direction", () => {
  assert.equal(normalizeInventoryMovementQuantity("PURCHASE", -5), 5);
  assert.equal(normalizeInventoryMovementQuantity("RETURN", 2), 2);
  assert.equal(normalizeInventoryMovementQuantity("DAMAGE", 4), -4);
  assert.equal(normalizeInventoryMovementQuantity("SALE", -3), -3);
  assert.equal(normalizeInventoryMovementQuantity("ADJUSTMENT", -2), -2);
});

test("orders can only move through the supported fulfilment sequence", () => {
  assert.equal(canTransitionOrderStatus("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionOrderStatus("PENDING", "SHIPPED"), false);
  assert.equal(canTransitionOrderStatus("SHIPPED", "DELIVERED"), true);
  assert.equal(canTransitionOrderStatus("DELIVERED", "COMPLETED"), true);
  assert.equal(canTransitionOrderStatus("COMPLETED", "PROCESSING"), false);
});

test("booking edits require a service, date, and valid start time", () => {
  assert.equal(
    rescheduleBookingSchema.safeParse({
      serviceId: id,
      scheduledDate: "2030-01-01",
      startTime: "09:30",
    }).success,
    true,
  );
  assert.equal(
    rescheduleBookingSchema.safeParse({
      serviceId: id,
      scheduledDate: "2030-01-01",
      startTime: "25:00",
    }).success,
    false,
  );
});
