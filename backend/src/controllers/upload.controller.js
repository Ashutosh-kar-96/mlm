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
