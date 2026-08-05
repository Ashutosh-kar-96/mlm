import * as adminService from "../services/admin.service.js";
import { success } from "../utils/apiResponse.js";

export const login = async (req, res, next) => {
  try {
    success(res, await adminService.login(req.body));
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    success(res, await adminService.refreshToken(req.body));
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    success(res, await adminService.logout());
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    success(res, await adminService.changePassword(req.user?.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const dashboard = async (req, res, next) => {
  try {
    success(res, await adminService.getDashboard());
  } catch (err) {
    next(err);
  }
};
