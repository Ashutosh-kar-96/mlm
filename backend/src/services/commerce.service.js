import prisma from "../config/db.js";
import { pagination } from "../utils/query.js";
import { assertNewcomerOrderLimit, processOrderBusiness, walletBalance } from "./mlm.service.js";

const money = (value) => Number(value || 0);
const orderId = () => `ORD${Date.now().toString().slice(-10)}`;
const txnId = () => `txn_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
const shippingCharge = (subtotal) => {
  const amount = money(subtotal);
  if (amount <= 0) return 0;
  if (amount <= 6000) return 199;
  if (amount <= 13000) return 299;
  if (amount <= 29000) return 499;
  return 699;
};
const productWriteFields = [
  "name",
  "description",
  "category",
  "brand",
  "sku",
  "hsnCode",
  "size",
  "color",
  "material",
  "price",
  "offerPrice",
  "discountPercent",
  "pv",
  "bv",
  "gstPercent",
  "stock",
  "imageUrl",
  "imageName",
  "imageMime",
  "imageData",
  "highlights",
  "careInstructions",
  "active",
];
const numberFields = ["price", "offerPrice", "discountPercent", "pv", "bv", "gstPercent", "stock"];

const productPayload = (data = {}) =>
  Object.fromEntries(
    productWriteFields
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, numberFields.includes(key) && data[key] !== null ? Number(data[key]) : data[key]])
  );

const normalizeImages = (images = []) =>
  (Array.isArray(images) ? images : [])
    .map((image, index) => ({
      imageUrl: image.imageUrl || null,
      imageName: image.imageName || null,
      imageMime: image.imageMime || null,
      imageData: image.imageData || null,
      sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
      isPrimary: Boolean(image.isPrimary),
    }))
    .filter((image) => image.imageUrl || (image.imageMime && image.imageData));

const legacyImageFromGallery = (images = []) => {
  const primary = images.find((image) => image.isPrimary) || images[0];
  if (!primary) return {};
  return {
    imageUrl: primary.imageUrl || "",
    imageName: primary.imageName || "",
    imageMime: primary.imageMime || "",
    imageData: primary.imageData || "",
  };
};

const productInclude = {
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { id: "asc" }] },
};

export const listProducts = async (query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const where = {
    ...(query.active === undefined ? { active: true } : query.active === "all" ? {} : { active: query.active === "true" }),
    ...(query.q ? {
      OR: [
        { name: { contains: query.q } },
        { sku: { contains: query.q } },
        { category: { contains: query.q } },
        { brand: { contains: query.q } },
      ],
    } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, include: productInclude, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where }),
  ]);
  return { items, meta: { page, limit, total } };
};

export const createProduct = async (data) => {
  const images = normalizeImages(data.images);
  const legacyImage = images.length ? legacyImageFromGallery(images) : {};
  return prisma.product.create({
    data: {
      ...productPayload(data),
      ...legacyImage,
      gstPercent: data.gstPercent ?? 0,
      stock: data.stock ?? 0,
      active: data.active ?? true,
      ...(images.length ? {
        images: {
          create: images.map((image, index) => ({
            ...image,
            sortOrder: index,
            isPrimary: image.isPrimary || index === 0,
          })),
        },
      } : {}),
    },
    include: productInclude,
  });
};

export const updateProduct = async (id, data) => {
  const images = data.images === undefined ? undefined : normalizeImages(data.images);
  const legacyImage = images?.length ? legacyImageFromGallery(images) : {};

  return prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: Number(id) } });
    }

    return tx.product.update({
      where: { id: Number(id) },
      data: {
        ...productPayload(data),
        ...legacyImage,
        ...(images?.length ? {
          images: {
            create: images.map((image, index) => ({
              ...image,
              sortOrder: index,
              isPrimary: image.isPrimary || index === 0,
            })),
          },
        } : {}),
      },
      include: productInclude,
    });
  });
};

export const cart = (regno) =>
  prisma.cartItem.findMany({
    where: { regno },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" },
  });

export const addToCart = async (regno, { productId, quantity = 1 }) => {
  const count = Number(quantity);
  if (!productId || !Number.isFinite(count) || count <= 0) {
    const error = new Error("Product and quantity are required");
    error.status = 400;
    throw error;
  }
  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product || !product.active) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  return prisma.cartItem.upsert({
    where: { regno_productId: { regno, productId: product.id } },
    update: { quantity: { increment: count } },
    create: { regno, productId: product.id, quantity: count },
    include: { product: { include: productInclude } },
  });
};

export const updateCartItem = (regno, id, { quantity }) => {
  const count = Number(quantity);
  if (!Number.isFinite(count) || count <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.status = 400;
    throw error;
  }
  return prisma.cartItem.update({
    where: { id: Number(id), regno },
    data: { quantity: count },
    include: { product: { include: productInclude } },
  });
};

export const removeCartItem = (regno, id) =>
  prisma.cartItem.delete({ where: { id: Number(id), regno } });

export const checkout = async (regno, data = {}) => {
  if (data.paymentMode !== "Wallet") {
    const error = new Error("Online payment is disabled. Please use wallet payment.");
    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findUnique({ where: { regno }, include: { rank: true } });
  const items = await cart(regno);
  if (!member || items.length === 0) {
    const error = new Error("Cart is empty");
    error.status = 400;
    throw error;
  }

  const subtotal = items.reduce((sum, item) => sum + money(item.product.offerPrice || item.product.price) * item.quantity, 0);
  const gst = items.reduce((sum, item) => sum + (money(item.product.offerPrice || item.product.price) * item.quantity * money(item.product.gstPercent)) / 100, 0);
  const shipping = shippingCharge(subtotal);
  const totalWithGst = subtotal + gst + shipping;
  const total = subtotal + shipping;
  const bv = items.reduce((sum, item) => sum + money(item.product.bv) * item.quantity, 0);
  const pv = items.reduce((sum, item) => sum + money(item.product.pv) * item.quantity, 0);
  const id = orderId();

  for (const item of items) {
    if (item.product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${item.product.name}`);
      error.status = 400;
      throw error;
    }
  }

  assertNewcomerOrderLimit(member, total);

  if (data.paymentMode === "Wallet") {
    const balance = await walletBalance(regno);
    if (balance < total) {
      const error = new Error("Insufficient wallet balance");
      error.status = 400;
      throw error;
    }
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderId: id,
        regno,
        name: [member.firstName, member.lastName].filter(Boolean).join(" "),
        shopId: data.shopId,
        pv,
        bv,
        totalAmount: total,
        saleDate: new Date(),
        approvedStatus: 1,
        paymentMode: "Wallet",
        totalGst: gst,
        totalWithGst,
        shippingCost: shipping,
        subTotalAmount: subtotal,
        shipAddress: data.shipAddress,
        shipCity: data.shipCity,
        shipState: data.shipState,
        shipPincode: data.shipPincode,
        shipMobile: data.shipMobile,
        items: {
          create: items.map((item, index) => ({
            slNo: index + 1,
            productId: item.productId,
            productDescription: item.product.name,
            price: item.product.price,
            offerPrice: item.product.offerPrice || item.product.price,
            discountPercent: item.product.discountPercent || 0,
            quantity: item.quantity,
            grossAmount: money(item.product.offerPrice || item.product.price) * item.quantity,
            gst: (money(item.product.offerPrice || item.product.price) * item.quantity * money(item.product.gstPercent)) / 100,
          })),
        },
      },
      include: { items: true },
    });

    await tx.onlineTransaction.create({
      data: {
        regno,
        name: order.name,
        mobile: member.mobileNo,
        amountTxnId: txnId(),
        orderId: id,
        transactionAmount: total,
        txnDate: new Date(),
      },
    });

    if (data.paymentMode === "Wallet") {
      await tx.walletLedger.create({
        data: {
          regno,
          type: "Debit",
          description: `Order ${id}`,
          amount: -total,
          referenceId: id,
        },
      });
    }

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await processOrderBusiness({ order, buyer: member, baseAmount: bv, bv }, tx);

    await tx.cartItem.deleteMany({ where: { regno } });
    return order;
  });
};

export const walletLedger = async (regno, query = {}) => {
  const { skip, take, page, limit } = pagination(query);
  const [items, total] = await Promise.all([
    prisma.walletLedger.findMany({ where: { regno }, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.walletLedger.count({ where: { regno } }),
  ]);
  return { items, meta: { page, limit, total } };
};

export const addFund = async (regno, { amount }) => {
  const member = await prisma.member.findUnique({ where: { regno } });
  const value = money(amount);
  if (!member || value <= 0) {
    const error = new Error("Amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const txn = await tx.onlineTransaction.create({
      data: {
        regno,
        name: [member.firstName, member.lastName].filter(Boolean).join(" "),
        mobile: member.mobileNo,
        amountTxnId: txnId(),
        transactionAmount: value,
        txnDate: new Date(),
      },
    });
    await tx.walletLedger.create({
      data: {
        regno,
        type: "Credit",
        description: "Add fund",
        amount: value,
        referenceId: txn.amountTxnId,
      },
    });
    return txn;
  });
};
