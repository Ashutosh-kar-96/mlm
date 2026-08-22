import * as uploadService from "../services/upload.service.js";
import { success } from "../utils/apiResponse.js";

export const list = async (req, res, next) => {
  try {
    success(res, await uploadService.list(req.user.regno, req.query));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    success(res, await uploadService.create(req.user.regno, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const servePublicUpload = async (req, res, next) => {
  try {
    const requestPath = req.originalUrl.split("?")[0];
    const fileUrl = requestPath.replace(/^\/api\/public-uploads/, "/uploads");
    const file = await uploadService.fileByUrl(fileUrl);

    if (!file?.fileData) {
      const error = new Error("Uploaded file not found");
      error.status = 404;
      throw error;
    }

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", String(file.fileSize || file.fileData.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.fileName || "document")}"`);
    res.send(Buffer.from(file.fileData));
  } catch (err) {
    next(err);
  }
};
