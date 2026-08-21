import prisma from "../config/db.js";
import { assertMemberProfileEditable } from "./profile-lock.service.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxFileBytes = Number(process.env.KYC_UPLOAD_MAX_BYTES || 5 * 1024 * 1024);

const publicUploadSelect = {
  id: true,
  regno: true,
  type: true,
  fileName: true,
  fileUrl: true,
  mimeType: true,
  fileSize: true,
  status: true,
  createdAt: true,
};

const sanitize = (value, fallback = "document") =>
  String(value || fallback)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || fallback;

const parseDataUrl = (dataUrl = "") => {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
};

const storedFile = (regno, data) => {
  if (!data.fileData) {
    return {
      fileUrl: data.fileUrl || data.url,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      fileData: undefined,
    };
  }

  const parsed = parseDataUrl(data.fileData);
  if (!parsed) {
    const error = new Error("Uploaded file data is invalid");
    error.status = 400;
    throw error;
  }
  if (!allowedMimeTypes.has(parsed.mime)) {
    const error = new Error("Only JPG, PNG, WEBP and PDF files are allowed");
    error.status = 400;
    throw error;
  }
  if (parsed.buffer.length > maxFileBytes) {
    const error = new Error("Uploaded file must be 5MB or smaller");
    error.status = 400;
    throw error;
  }

  const uploadType = sanitize(data.type, "kyc");
  const memberRegno = sanitize(regno, "member");
  const originalName = sanitize(data.fileName);
  const storedName = `${Date.now()}-${originalName}`;

  return {
    fileUrl: `/uploads/kyc/${memberRegno}/${uploadType}/${storedName}`,
    mimeType: parsed.mime,
    fileSize: parsed.buffer.length,
    fileData: parsed.buffer,
  };
};

export const create = async (regno, data) => {
  await assertMemberProfileEditable(regno);
  const file = storedFile(regno, data);
  return prisma.fileUpload.create({
    data: {
      regno,
      type: data.type,
      fileName: data.fileName,
      fileUrl: file.fileUrl || `/uploads/${data.type}/${data.fileName || "document"}`,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      fileData: file.fileData,
      status: data.status || "Pending",
    },
    select: publicUploadSelect,
  });
};

export const list = (regno, query = {}) =>
  prisma.fileUpload.findMany({
    where: {
      regno,
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: publicUploadSelect,
  });

export const fileByUrl = (fileUrl) =>
  prisma.fileUpload.findFirst({
    where: { fileUrl },
    select: {
      fileName: true,
      mimeType: true,
      fileSize: true,
      fileData: true,
      createdAt: true,
    },
  });
