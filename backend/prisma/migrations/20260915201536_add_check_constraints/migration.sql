-- Custom constraints that Prisma's declarative schema syntax cannot express.
-- Every constraint here is referenced by a comment in schema.prisma next to
-- the model(s) it governs.

-- Ratings between 1 and 5
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5);

-- Non-negative monetary amounts
ALTER TABLE "services" ADD CONSTRAINT "services_base_price_check" CHECK ("base_price" >= 0);
ALTER TABLE "services" ADD CONSTRAINT "services_min_price_check" CHECK ("min_price" IS NULL OR "min_price" >= 0);
ALTER TABLE "services" ADD CONSTRAINT "services_max_price_check" CHECK ("max_price" IS NULL OR "max_price" >= 0);
ALTER TABLE "services" ADD CONSTRAINT "services_price_range_check" CHECK ("min_price" IS NULL OR "max_price" IS NULL OR "min_price" <= "max_price");

ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_estimated_price_check" CHECK ("estimated_price" IS NULL OR "estimated_price" >= 0);
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_final_price_check" CHECK ("final_price" IS NULL OR "final_price" >= 0);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_estimated_price_check" CHECK ("estimated_price" >= 0);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_final_price_check" CHECK ("final_price" IS NULL OR "final_price" >= 0);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_end_after_start_check" CHECK ("end_time" > "start_time");

ALTER TABLE "products" ADD CONSTRAINT "products_price_check" CHECK ("price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_compare_at_price_check" CHECK ("compare_at_price" IS NULL OR "compare_at_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_cost_price_check" CHECK ("cost_price" IS NULL OR "cost_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_weight_check" CHECK ("weight" IS NULL OR "weight" >= 0);

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_unit_price_check" CHECK ("unit_price" >= 0);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_check" CHECK ("quantity" > 0);

ALTER TABLE "orders" ADD CONSTRAINT "orders_subtotal_check" CHECK ("subtotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_amount_check" CHECK ("discount_amount" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_amount_check" CHECK ("shipping_amount" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_tax_amount_check" CHECK ("tax_amount" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_amount_check" CHECK ("total_amount" >= 0);

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_unit_price_check" CHECK ("unit_price" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_discount_amount_check" CHECK ("discount_amount" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_total_amount_check" CHECK ("total_amount" >= 0);

ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_check" CHECK ("amount" >= 0);
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_amount_check" CHECK ("amount" > 0);

ALTER TABLE "promotions" ADD CONSTRAINT "promotions_discount_value_check" CHECK ("discount_value" > 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_usage_count_check" CHECK ("usage_count" >= 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_usage_limit_check" CHECK ("usage_limit" IS NULL OR "usage_limit" >= 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_expires_after_starts_check" CHECK ("expires_at" > "starts_at");
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_minimum_order_amount_check" CHECK ("minimum_order_amount" IS NULL OR "minimum_order_amount" >= 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_maximum_discount_amount_check" CHECK ("maximum_discount_amount" IS NULL OR "maximum_discount_amount" >= 0);

ALTER TABLE "business_commission_rules" ADD CONSTRAINT "commission_rules_service_percent_check" CHECK ("service_commission_percent" BETWEEN 0 AND 100);
ALTER TABLE "business_commission_rules" ADD CONSTRAINT "commission_rules_product_percent_check" CHECK ("product_commission_percent" BETWEEN 0 AND 100);
ALTER TABLE "business_commission_rules" ADD CONSTRAINT "commission_rules_fixed_fee_check" CHECK ("fixed_fee" >= 0);
ALTER TABLE "business_commission_rules" ADD CONSTRAINT "commission_rules_effective_range_check" CHECK ("effective_until" IS NULL OR "effective_until" > "effective_from");

ALTER TABLE "business_transactions" ADD CONSTRAINT "business_transactions_gross_amount_check" CHECK ("gross_amount" >= 0);
ALTER TABLE "business_transactions" ADD CONSTRAINT "business_transactions_platform_fee_check" CHECK ("platform_fee" >= 0);
ALTER TABLE "business_transactions" ADD CONSTRAINT "business_transactions_net_amount_check" CHECK ("net_amount" >= 0);

ALTER TABLE "business_payouts" ADD CONSTRAINT "business_payouts_amount_check" CHECK ("amount" >= 0);

-- Inventory quantities non-negative
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_quantity_check" CHECK ("quantity" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_reserved_quantity_check" CHECK ("reserved_quantity" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_available_quantity_check" CHECK ("available_quantity" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_low_stock_threshold_check" CHECK ("low_stock_threshold" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_reorder_quantity_check" CHECK ("reorder_quantity" >= 0);

-- Latitude / longitude ranges
ALTER TABLE "business_branches" ADD CONSTRAINT "business_branches_latitude_check" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90);
ALTER TABLE "business_branches" ADD CONSTRAINT "business_branches_longitude_check" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180);
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_latitude_check" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90);
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_longitude_check" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180);

-- Vehicle-compatibility year ranges (year_from <= year_to when both present)
ALTER TABLE "service_vehicle_compatibility" ADD CONSTRAINT "service_vehicle_compat_year_range_check" CHECK ("year_from" IS NULL OR "year_to" IS NULL OR "year_from" <= "year_to");
ALTER TABLE "product_vehicle_compatibility" ADD CONSTRAINT "product_vehicle_compat_year_range_check" CHECK ("year_from" IS NULL OR "year_to" IS NULL OR "year_from" <= "year_to");

-- Payment must belong to exactly one of order / booking / service_request
ALTER TABLE "payments" ADD CONSTRAINT "payments_single_payable_check" CHECK (
  (CASE WHEN "order_id" IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN "booking_id" IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN "service_request_id" IS NOT NULL THEN 1 ELSE 0 END) = 1
);

-- ReviewImage must belong to exactly one of business review / product review
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_single_parent_check" CHECK (
  (CASE WHEN "business_review_id" IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN "product_review_id" IS NOT NULL THEN 1 ELSE 0 END) = 1
);

-- PromotionUsage must relate to at least one of order / booking
ALTER TABLE "promotion_usages" ADD CONSTRAINT "promotion_usages_has_transaction_check" CHECK (
  "order_id" IS NOT NULL OR "booking_id" IS NOT NULL
);

-- Dispute must be anchored to at least one of order / booking / service_request
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_has_transaction_check" CHECK (
  "order_id" IS NOT NULL OR "booking_id" IS NOT NULL OR "service_request_id" IS NOT NULL
);

-- A customer may have at most one ACTIVE cart at a time (partial unique index;
-- Prisma's schema syntax cannot express a filtered/partial unique index).
CREATE UNIQUE INDEX "carts_one_active_per_customer" ON "carts" ("customer_id") WHERE "status" = 'ACTIVE';
