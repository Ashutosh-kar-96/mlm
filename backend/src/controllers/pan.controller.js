import * as panService from "../services/pan.service.js";
import { success } from "../utils/apiResponse.js";

export const pending = async (req, res, next) => {
  try {
    success(res, await panService.listPan(req.query, "Pending"));
  } catch (err) {
    next(err);
  }
};

export const verified = async (req, res, next) => {
  try {
    success(res, await panService.listPan(req.query, "Verified"));
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    success(res, await panService.listPan(req.query, req.query.status));
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    success(res, await panService.updatePanStatus(req.params.id, "Verified", req.user?.username));
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    success(res, await panService.updatePanStatus(req.params.id, req.body.status, req.user?.username));
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    success(res, await panService.updatePanStatus(req.params.id, "Cancelled", req.user?.username));
  } catch (err) {
    next(err);
  }
};
