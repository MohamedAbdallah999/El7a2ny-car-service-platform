-- Link the request/approval workflow to the booking it controls.
ALTER TABLE "bookings" ADD COLUMN "service_request_id" UUID;

CREATE UNIQUE INDEX "bookings_service_request_id_key"
ON "bookings"("service_request_id");

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_service_request_id_fkey"
FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve pending bookings created before the request workflow was linked.
-- The deterministic UUID makes the backfill safe and repeatable for a given
-- booking while the booking number keeps the generated request number unique.
INSERT INTO "service_requests" (
  "id",
  "request_number",
  "customer_id",
  "vehicle_id",
  "business_id",
  "branch_id",
  "service_id",
  "title",
  "description",
  "status",
  "priority",
  "estimated_price",
  "created_at",
  "updated_at"
)
SELECT
  md5('service-request-' || b."id"::text)::uuid,
  left('SR-' || b."booking_number", 50),
  b."customer_id",
  b."vehicle_id",
  b."business_id",
  b."branch_id",
  b."service_id",
  left('Request for ' || s."name", 200),
  b."customer_notes",
  'PENDING'::"ServiceRequestStatus",
  'MEDIUM'::"ServiceRequestPriority",
  b."estimated_price",
  b."created_at",
  b."updated_at"
FROM "bookings" b
JOIN "services" s ON s."id" = b."service_id"
WHERE b."status" = 'PENDING'
  AND b."service_request_id" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "service_requests" sr
    WHERE sr."request_number" = left('SR-' || b."booking_number", 50)
  );

UPDATE "bookings" b
SET "service_request_id" = md5('service-request-' || b."id"::text)::uuid
WHERE b."status" = 'PENDING'
  AND b."service_request_id" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "service_requests" sr
    WHERE sr."id" = md5('service-request-' || b."id"::text)::uuid
  );

-- Existing product/business image references used the authenticated document
-- path. Move only records already declared public by their owning models.
UPDATE "businesses"
SET "logo_url" = replace("logo_url", '/api/uploads/', '/api/uploads/public/')
WHERE "logo_url" LIKE '%/api/uploads/%'
  AND "logo_url" NOT LIKE '%/api/uploads/public/%';

UPDATE "businesses"
SET "cover_image_url" = replace("cover_image_url", '/api/uploads/', '/api/uploads/public/')
WHERE "cover_image_url" LIKE '%/api/uploads/%'
  AND "cover_image_url" NOT LIKE '%/api/uploads/public/%';

UPDATE "product_images"
SET "image_url" = replace("image_url", '/api/uploads/', '/api/uploads/public/')
WHERE "image_url" LIKE '%/api/uploads/%'
  AND "image_url" NOT LIKE '%/api/uploads/public/%';

-- Reconcile historical confirmed/fulfilled orders that predate transactional
-- stock allocation. Each order item receives one SALE audit record and stock
-- is changed only when the selected active inventory has enough quantity.
DO $$
DECLARE
  line RECORD;
  stock RECORD;
BEGIN
  FOR line IN
    SELECT oi.*, o."order_number"
    FROM "order_items" oi
    JOIN "orders" o ON o."id" = oi."order_id"
    WHERE o."status" IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED')
      AND NOT EXISTS (
        SELECT 1 FROM "inventory_movements" im
        WHERE im."reference_type" = 'ORDER_ITEM'
          AND im."reference_id" = oi."id"
          AND im."type" = 'SALE'
      )
    ORDER BY oi."created_at" ASC
  LOOP
    SELECT i.* INTO stock
    FROM "inventory" i
    JOIN "business_branches" bb ON bb."id" = i."branch_id"
    WHERE i."product_id" = line."product_id"
      AND i."business_id" = line."business_id"
      AND bb."status" = 'ACTIVE'
    ORDER BY bb."is_primary" DESC, i."created_at" ASC
    LIMIT 1
    FOR UPDATE OF i;

    IF FOUND
      AND stock."quantity" >= line."quantity"
      AND stock."available_quantity" >= line."quantity"
    THEN
      UPDATE "inventory"
      SET
        "quantity" = "quantity" - line."quantity",
        "available_quantity" = "available_quantity" - line."quantity",
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = stock."id";

      INSERT INTO "inventory_movements" (
        "id", "inventory_id", "product_id", "type", "quantity",
        "previous_quantity", "new_quantity", "reference_type",
        "reference_id", "notes"
      ) VALUES (
        md5('order-sale-' || line."id"::text)::uuid,
        stock."id",
        line."product_id",
        'SALE'::"InventoryMovementType",
        -line."quantity",
        stock."quantity",
        stock."quantity" - line."quantity",
        'ORDER_ITEM',
        line."id",
        'Historical stock reconciliation for order ' || line."order_number"
      );
    END IF;
  END LOOP;
END $$;
