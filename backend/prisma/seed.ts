import "dotenv/config";

import { prisma } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";

// Fixed, deterministic UUIDs keep this seed idempotent: re-running it
// upserts the same rows instead of creating duplicates. This is NOT real
// user data — every account below is a clearly fake development fixture.
const ids = {
  superAdminUser: "00000000-0000-4000-8000-000000000001",
  adminUser: "00000000-0000-4000-8000-000000000002",
  admin: "00000000-0000-4000-8000-000000000003",
  customerUser: "00000000-0000-4000-8000-000000000004",
  customer: "00000000-0000-4000-8000-000000000005",

  makeToyota: "00000000-0000-4000-8000-000000000010",
  makeBmw: "00000000-0000-4000-8000-000000000011",
  makeHyundai: "00000000-0000-4000-8000-000000000012",
  makeMercedes: "00000000-0000-4000-8000-000000000013",
  makeKia: "00000000-0000-4000-8000-000000000014",

  modelCorolla: "00000000-0000-4000-8000-000000000020",
  modelCamry: "00000000-0000-4000-8000-000000000021",
  model3Series: "00000000-0000-4000-8000-000000000022",
  modelX5: "00000000-0000-4000-8000-000000000023",
  modelElantra: "00000000-0000-4000-8000-000000000024",
  modelTucson: "00000000-0000-4000-8000-000000000025",
  modelCClass: "00000000-0000-4000-8000-000000000026",
  modelSportage: "00000000-0000-4000-8000-000000000027",

  serviceCategoryMaintenance: "00000000-0000-4000-8000-000000000030",
  serviceCategoryTires: "00000000-0000-4000-8000-000000000031",
  serviceCategoryDetailing: "00000000-0000-4000-8000-000000000032",

  productCategoryFluids: "00000000-0000-4000-8000-000000000040",
  productCategoryFilters: "00000000-0000-4000-8000-000000000041",
  productCategoryBrakes: "00000000-0000-4000-8000-000000000042",
  productCategoryElectrical: "00000000-0000-4000-8000-000000000043",
  productCategoryTires: "00000000-0000-4000-8000-000000000044",

  business: "00000000-0000-4000-8000-000000000050",
  branch: "00000000-0000-4000-8000-000000000051",
  commissionRule: "00000000-0000-4000-8000-000000000052",

  serviceOilChange: "00000000-0000-4000-8000-000000000060",
  serviceBrakeInspection: "00000000-0000-4000-8000-000000000061",
  serviceBrakePadReplacement: "00000000-0000-4000-8000-000000000062",
  serviceEngineDiagnostics: "00000000-0000-4000-8000-000000000063",
  serviceAcService: "00000000-0000-4000-8000-000000000064",
  serviceBatteryReplacement: "00000000-0000-4000-8000-000000000065",
  serviceTireReplacement: "00000000-0000-4000-8000-000000000066",
  serviceWheelAlignment: "00000000-0000-4000-8000-000000000067",
  serviceCarDetailing: "00000000-0000-4000-8000-000000000068",

  productEngineOil: "00000000-0000-4000-8000-000000000070",
  productOilFilter: "00000000-0000-4000-8000-000000000071",
  productAirFilter: "00000000-0000-4000-8000-000000000072",
  productBrakePads: "00000000-0000-4000-8000-000000000073",
  productSparkPlugs: "00000000-0000-4000-8000-000000000074",
  productCarBattery: "00000000-0000-4000-8000-000000000075",
  productEngineAirFilter: "00000000-0000-4000-8000-000000000076",
  productCabinFilter: "00000000-0000-4000-8000-000000000077",
  productTire: "00000000-0000-4000-8000-000000000078",
  productBrakeDisc: "00000000-0000-4000-8000-000000000079",

  customerAddress: "00000000-0000-4000-8000-000000000080",
  customerVehicle: "00000000-0000-4000-8000-000000000081",
  favoriteBusiness: "00000000-0000-4000-8000-000000000082",
  favoriteProduct: "00000000-0000-4000-8000-000000000083",
  booking: "00000000-0000-4000-8000-000000000084",

  platformSettingName: "00000000-0000-4000-8000-000000000090",
  platformSettingCurrency: "00000000-0000-4000-8000-000000000091",
  platformSettingCommission: "00000000-0000-4000-8000-000000000092",
};

const requireSeedPassword = (name: string): string => {
  const value = process.env[name];
  if (!value || value.length < 12) {
    throw new Error(`${name} must be set to a password of at least 12 characters`);
  }
  return value;
};

async function main(): Promise<void> {
  const [superAdminPasswordHash, adminPasswordHash, customerPasswordHash] =
    await Promise.all([
      hashPassword(requireSeedPassword("SEED_SUPER_ADMIN_PASSWORD")),
      hashPassword(requireSeedPassword("SEED_ADMIN_PASSWORD")),
      hashPassword(requireSeedPassword("SEED_CUSTOMER_PASSWORD")),
    ]);

  const superAdminUser = await prisma.user.upsert({
    where: { id: ids.superAdminUser },
    create: {
      id: ids.superAdminUser,
      email: "superadmin@el7a2ny.dev",
      passwordHash: superAdminPasswordHash,
      firstName: "Sara",
      lastName: "Youssef",
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
    update: { passwordHash: superAdminPasswordHash },
  });

  const adminUser = await prisma.user.upsert({
    where: { id: ids.adminUser },
    create: {
      id: ids.adminUser,
      email: "admin@el7a2ny.dev",
      passwordHash: adminPasswordHash,
      firstName: "Karim",
      lastName: "Adel",
      role: "ADMIN",
      emailVerified: true,
    },
    update: { passwordHash: adminPasswordHash },
  });

  const admin = await prisma.admin.upsert({
    where: { id: ids.admin },
    create: { id: ids.admin, userId: adminUser.id },
    update: {},
  });

  const customerUser = await prisma.user.upsert({
    where: { id: ids.customerUser },
    create: {
      id: ids.customerUser,
      email: "customer@el7a2ny.dev",
      phone: "+201000000000",
      passwordHash: customerPasswordHash,
      firstName: "Mona",
      lastName: "Hassan",
      role: "CUSTOMER",
      emailVerified: true,
      phoneVerified: true,
    },
    update: { passwordHash: customerPasswordHash },
  });

  const customer = await prisma.customer.upsert({
    where: { id: ids.customer },
    create: {
      id: ids.customer,
      userId: customerUser.id,
      preferredLanguage: "ar",
      preferredCurrency: "EGP",
      marketingConsent: true,
    },
    update: {},
  });

  // --- Vehicle makes & models -------------------------------------------
  const [toyota, bmw, hyundai, mercedes, kia] = await Promise.all([
    prisma.vehicleMake.upsert({ where: { id: ids.makeToyota }, create: { id: ids.makeToyota, name: "Toyota" }, update: {} }),
    prisma.vehicleMake.upsert({ where: { id: ids.makeBmw }, create: { id: ids.makeBmw, name: "BMW" }, update: {} }),
    prisma.vehicleMake.upsert({ where: { id: ids.makeHyundai }, create: { id: ids.makeHyundai, name: "Hyundai" }, update: {} }),
    prisma.vehicleMake.upsert({ where: { id: ids.makeMercedes }, create: { id: ids.makeMercedes, name: "Mercedes-Benz" }, update: {} }),
    prisma.vehicleMake.upsert({ where: { id: ids.makeKia }, create: { id: ids.makeKia, name: "Kia" }, update: {} }),
  ]);

  const corolla = await prisma.vehicleModel.upsert({
    where: { id: ids.modelCorolla },
    create: { id: ids.modelCorolla, makeId: toyota.id, name: "Corolla" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelCamry },
    create: { id: ids.modelCamry, makeId: toyota.id, name: "Camry" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.model3Series },
    create: { id: ids.model3Series, makeId: bmw.id, name: "3 Series" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelX5 },
    create: { id: ids.modelX5, makeId: bmw.id, name: "X5" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelElantra },
    create: { id: ids.modelElantra, makeId: hyundai.id, name: "Elantra" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelTucson },
    create: { id: ids.modelTucson, makeId: hyundai.id, name: "Tucson" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelCClass },
    create: { id: ids.modelCClass, makeId: mercedes.id, name: "C-Class" },
    update: {},
  });
  await prisma.vehicleModel.upsert({
    where: { id: ids.modelSportage },
    create: { id: ids.modelSportage, makeId: kia.id, name: "Sportage" },
    update: {},
  });

  // --- Categories ---------------------------------------------------------
  const serviceCategoryMaintenance = await prisma.serviceCategory.upsert({
    where: { id: ids.serviceCategoryMaintenance },
    create: { id: ids.serviceCategoryMaintenance, name: "Maintenance", slug: "maintenance" },
    update: {},
  });
  const serviceCategoryTires = await prisma.serviceCategory.upsert({
    where: { id: ids.serviceCategoryTires },
    create: { id: ids.serviceCategoryTires, name: "Tires & Wheels", slug: "tires-wheels" },
    update: {},
  });
  const serviceCategoryDetailing = await prisma.serviceCategory.upsert({
    where: { id: ids.serviceCategoryDetailing },
    create: { id: ids.serviceCategoryDetailing, name: "Detailing", slug: "detailing" },
    update: {},
  });

  const productCategoryFluids = await prisma.productCategory.upsert({
    where: { id: ids.productCategoryFluids },
    create: { id: ids.productCategoryFluids, name: "Fluids & Oils", slug: "fluids-oils" },
    update: {},
  });
  const productCategoryFilters = await prisma.productCategory.upsert({
    where: { id: ids.productCategoryFilters },
    create: { id: ids.productCategoryFilters, name: "Filters", slug: "filters" },
    update: {},
  });
  const productCategoryBrakes = await prisma.productCategory.upsert({
    where: { id: ids.productCategoryBrakes },
    create: { id: ids.productCategoryBrakes, name: "Brakes", slug: "brakes" },
    update: {},
  });
  const productCategoryElectrical = await prisma.productCategory.upsert({
    where: { id: ids.productCategoryElectrical },
    create: { id: ids.productCategoryElectrical, name: "Electrical", slug: "electrical" },
    update: {},
  });
  const productCategoryTires = await prisma.productCategory.upsert({
    where: { id: ids.productCategoryTires },
    create: { id: ids.productCategoryTires, name: "Tires", slug: "tires" },
    update: {},
  });

  // --- Business, branch, hours, commission rule ---------------------------
  const business = await prisma.business.upsert({
    where: { id: ids.business },
    create: {
      id: ids.business,
      adminId: admin.id,
      name: "El7a2ny Garage Nasr City",
      slug: "el7a2ny-garage-nasr-city",
      description: "Full-service garage specializing in maintenance, tires, and detailing.",
      businessType: "MULTI_SERVICE",
      email: "contact@el7a2ny-garage.dev",
      phone: "+20222222222",
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    },
    update: {},
  });

  const branch = await prisma.businessBranch.upsert({
    where: { id: ids.branch },
    create: {
      id: ids.branch,
      businessId: business.id,
      name: "Nasr City Main Branch",
      phone: "+20222222222",
      addressLine1: "12 Abbas El Akkad St.",
      city: "Cairo",
      country: "Egypt",
      latitude: 30.0561,
      longitude: 31.3392,
      isPrimary: true,
      status: "ACTIVE",
    },
    update: {},
  });

  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
    const isFriday = dayOfWeek === 5;
    await prisma.businessHour.upsert({
      where: { branchId_dayOfWeek: { branchId: branch.id, dayOfWeek } },
      create: {
        branchId: branch.id,
        dayOfWeek,
        isClosed: isFriday,
        openingTime: isFriday ? null : new Date("1970-01-01T09:00:00Z"),
        closingTime: isFriday ? null : new Date("1970-01-01T20:00:00Z"),
      },
      update: {},
    });
  }

  await prisma.businessCommissionRule.upsert({
    where: { id: ids.commissionRule },
    create: {
      id: ids.commissionRule,
      businessId: business.id,
      serviceCommissionPercent: 10,
      productCommissionPercent: 8,
      fixedFee: 0,
      effectiveFrom: new Date("2026-01-01T00:00:00Z"),
      isActive: true,
    },
    update: {},
  });

  // --- Services -------------------------------------------------------
  const serviceSeed: Array<{
    id: string;
    name: string;
    categoryId: string;
    durationMinutes: number;
    basePrice: number;
  }> = [
    { id: ids.serviceOilChange, name: "Oil Change", categoryId: serviceCategoryMaintenance.id, durationMinutes: 30, basePrice: 450 },
    { id: ids.serviceBrakeInspection, name: "Brake Inspection", categoryId: serviceCategoryMaintenance.id, durationMinutes: 30, basePrice: 200 },
    { id: ids.serviceBrakePadReplacement, name: "Brake Pad Replacement", categoryId: serviceCategoryMaintenance.id, durationMinutes: 60, basePrice: 900 },
    { id: ids.serviceEngineDiagnostics, name: "Engine Diagnostics", categoryId: serviceCategoryMaintenance.id, durationMinutes: 45, basePrice: 350 },
    { id: ids.serviceAcService, name: "AC Service", categoryId: serviceCategoryMaintenance.id, durationMinutes: 60, basePrice: 500 },
    { id: ids.serviceBatteryReplacement, name: "Battery Replacement", categoryId: serviceCategoryMaintenance.id, durationMinutes: 20, basePrice: 2200 },
    { id: ids.serviceTireReplacement, name: "Tire Replacement", categoryId: serviceCategoryTires.id, durationMinutes: 40, basePrice: 1800 },
    { id: ids.serviceWheelAlignment, name: "Wheel Alignment", categoryId: serviceCategoryTires.id, durationMinutes: 45, basePrice: 400 },
    { id: ids.serviceCarDetailing, name: "Car Detailing", categoryId: serviceCategoryDetailing.id, durationMinutes: 120, basePrice: 1200 },
  ];

  for (const s of serviceSeed) {
    await prisma.service.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        businessId: business.id,
        branchId: branch.id,
        categoryId: s.categoryId,
        name: s.name,
        durationMinutes: s.durationMinutes,
        basePrice: s.basePrice,
        isOnlineBooking: true,
        isActive: true,
      },
      update: {},
    });
  }

  // --- Products & inventory ------------------------------------------
  const productSeed: Array<{
    id: string;
    name: string;
    sku: string;
    slug: string;
    categoryId: string;
    price: number;
    quantity: number;
  }> = [
    { id: ids.productEngineOil, name: "Engine Oil 5W-30 (4L)", sku: "EL7-OIL-5W30-4L", slug: "engine-oil-5w30-4l", categoryId: productCategoryFluids.id, price: 850, quantity: 40 },
    { id: ids.productOilFilter, name: "Oil Filter", sku: "EL7-FLT-OIL-001", slug: "oil-filter-001", categoryId: productCategoryFilters.id, price: 120, quantity: 60 },
    { id: ids.productAirFilter, name: "Air Filter", sku: "EL7-FLT-AIR-001", slug: "air-filter-001", categoryId: productCategoryFilters.id, price: 150, quantity: 50 },
    { id: ids.productBrakePads, name: "Brake Pads (Front Set)", sku: "EL7-BRK-PAD-F01", slug: "brake-pads-front-set", categoryId: productCategoryBrakes.id, price: 700, quantity: 30 },
    { id: ids.productSparkPlugs, name: "Spark Plugs (Set of 4)", sku: "EL7-ELE-SPK-004", slug: "spark-plugs-set-of-4", categoryId: productCategoryElectrical.id, price: 400, quantity: 45 },
    { id: ids.productCarBattery, name: "Car Battery 70Ah", sku: "EL7-ELE-BAT-070", slug: "car-battery-70ah", categoryId: productCategoryElectrical.id, price: 2100, quantity: 15 },
    { id: ids.productEngineAirFilter, name: "Engine Air Filter (Performance)", sku: "EL7-FLT-EAF-001", slug: "engine-air-filter-performance", categoryId: productCategoryFilters.id, price: 220, quantity: 25 },
    { id: ids.productCabinFilter, name: "Cabin Filter", sku: "EL7-FLT-CAB-001", slug: "cabin-filter-001", categoryId: productCategoryFilters.id, price: 180, quantity: 35 },
    { id: ids.productTire, name: "Tire 195/65R15", sku: "EL7-TIRE-195-65-15", slug: "tire-195-65r15", categoryId: productCategoryTires.id, price: 2600, quantity: 20 },
    { id: ids.productBrakeDisc, name: "Brake Disc (Front, Pair)", sku: "EL7-BRK-DSC-F01", slug: "brake-disc-front-pair", categoryId: productCategoryBrakes.id, price: 1500, quantity: 18 },
  ];

  for (const p of productSeed) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        businessId: business.id,
        categoryId: p.categoryId,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        price: p.price,
        status: "ACTIVE",
      },
      update: {},
    });

    await prisma.inventory.upsert({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
      create: {
        businessId: business.id,
        branchId: branch.id,
        productId: product.id,
        quantity: p.quantity,
        availableQuantity: p.quantity,
        lowStockThreshold: 5,
        reorderQuantity: 20,
      },
      update: {},
    });
  }

  // --- Customer vehicle, address, favorites, booking -----------------
  const vehicle = await prisma.vehicle.upsert({
    where: { id: ids.customerVehicle },
    create: {
      id: ids.customerVehicle,
      customerId: customer.id,
      makeId: toyota.id,
      modelId: corolla.id,
      year: 2021,
      color: "White",
      licensePlate: "ABC-1234",
      isPrimary: true,
    },
    update: {},
  });

  await prisma.customerAddress.upsert({
    where: { id: ids.customerAddress },
    create: {
      id: ids.customerAddress,
      customerId: customer.id,
      label: "Home",
      recipientName: "Mona Hassan",
      phone: "+201000000000",
      addressLine1: "5 Makram Ebeid St.",
      city: "Cairo",
      country: "Egypt",
      isDefault: true,
    },
    update: {},
  });

  await prisma.favoriteBusiness.upsert({
    where: { id: ids.favoriteBusiness },
    create: { id: ids.favoriteBusiness, customerId: customer.id, businessId: business.id },
    update: {},
  });

  await prisma.favoriteProduct.upsert({
    where: { id: ids.favoriteProduct },
    create: { id: ids.favoriteProduct, customerId: customer.id, productId: ids.productEngineOil },
    update: {},
  });

  await prisma.booking.upsert({
    where: { id: ids.booking },
    create: {
      id: ids.booking,
      bookingNumber: "BK-2026-000001",
      customerId: customer.id,
      businessId: business.id,
      branchId: branch.id,
      vehicleId: vehicle.id,
      serviceId: ids.serviceOilChange,
      scheduledDate: new Date("2026-09-20T00:00:00Z"),
      startTime: new Date("1970-01-01T10:00:00Z"),
      endTime: new Date("1970-01-01T10:30:00Z"),
      status: "CONFIRMED",
      estimatedPrice: 450,
      confirmedAt: new Date(),
    },
    update: {},
  });

  // --- Platform settings -----------------------------------------------
  await prisma.platformSetting.upsert({
    where: { id: ids.platformSettingName },
    create: { id: ids.platformSettingName, key: "platform_name", value: "El7a2ny", updatedByUserId: superAdminUser.id },
    update: {},
  });
  await prisma.platformSetting.upsert({
    where: { id: ids.platformSettingCurrency },
    create: { id: ids.platformSettingCurrency, key: "default_currency", value: "EGP", updatedByUserId: superAdminUser.id },
    update: {},
  });
  await prisma.platformSetting.upsert({
    where: { id: ids.platformSettingCommission },
    create: { id: ids.platformSettingCommission, key: "default_commission", value: { servicePercent: 10, productPercent: 8 }, updatedByUserId: superAdminUser.id },
    update: {},
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
