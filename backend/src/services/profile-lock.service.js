import prisma from "../config/db.js";

export const REQUIRED_PROFILE_DOCUMENTS = ["bank_passbook", "pan_card", "aadhaar_front", "aadhaar_back"];

export const allRequiredDocumentsUploaded = (uploads = []) => {
  const uploadedTypes = new Set(uploads.map((upload) => upload.type));
  return REQUIRED_PROFILE_DOCUMENTS.every((type) => uploadedTypes.has(type));
};

export const memberProfileLocked = async (regno, client = prisma) => {
  const uploads = await client.fileUpload.findMany({
    where: {
      regno,
      type: { in: REQUIRED_PROFILE_DOCUMENTS },
    },
    select: { type: true },
  });

  return allRequiredDocumentsUploaded(uploads);
};

export const assertMemberProfileEditable = async (regno, client = prisma) => {
  if (!(await memberProfileLocked(regno, client))) return;

  const error = new Error("Profile is locked after all documents are uploaded. Please request admin to make changes.");
  error.status = 403;
  throw error;
};
