import * as reportService from "../services/report.service.js";
import { success } from "../utils/apiResponse.js";

export const downlineBusiness = async (req, res, next) => {
  try {
    success(res, await reportService.downlineBusiness(req.query));
  } catch (err) {
    next(err);
  }
};

export const onlineTransactions = async (req, res, next) => {
  try {
    success(res, await reportService.onlineTransactions(req.query));
  } catch (err) {
    next(err);
  }
};

export const orders = async (req, res, next) => {
  try {
    success(res, await reportService.orders(req.query));
  } catch (err) {
    next(err);
  }
};

export const pool = (rankName) => async (req, res, next) => {
  try {
    success(res, await reportService.poolMembers(rankName, req.query));
  } catch (err) {
    next(err);
  }
};
