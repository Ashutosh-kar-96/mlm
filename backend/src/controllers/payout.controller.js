import * as payoutService from "../services/payout.service.js";
import { success } from "../utils/apiResponse.js";

export const pending = async (req, res, next) => {
  try {
    success(res, await payoutService.listPayouts(req.query, 0));
  } catch (err) {
    next(err);
  }
};

export const distributed = async (req, res, next) => {
  try {
    success(res, await payoutService.listPayouts(req.query, 1));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    success(res, await payoutService.createPayout(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const distribute = async (req, res, next) => {
  try {
    success(res, await payoutService.markDistributed(req.body.ids || [], req.body));
  } catch (err) {
    next(err);
  }
};
