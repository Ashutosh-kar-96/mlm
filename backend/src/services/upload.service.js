import prisma from "../config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { assertMemberProfileEditable } from "./profile-lock.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxFileBytes = Number(process.env.KYC_UPLOAD_MAX_BYTES || 5 * 1024 * 1024);

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

const storedFileUrl = async (regno, data) => {
  if (!data.fileData) return data.fileUrl || data.url;

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
  const targetDir = path.join(uploadsRoot, "kyc", memberRegno, uploadType);
  const storedName = `${Date.now()}-${originalName}`;
  const targetPath = path.join(targetDir, storedName);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, parsed.buffer);
  return `/uploads/kyc/${memberRegno}/${uploadType}/${storedName}`;
};

export const create = async (regno, data) => {
  await assertMemberProfileEditable(regno);
  const fileUrl = await storedFileUrl(regno, data);
  return prisma.fileUpload.create({
    data: {
      regno,
      type: data.type,
      fileName: data.fileName,
      fileUrl: fileUrl || `/uploads/${data.type}/${data.fileName || "document"}`,
      status: data.status || "Pending",
    },
  });
};

export const list = (regno, query = {}) =>
  prisma.fileUpload.findMany({
    where: {
      regno,
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
