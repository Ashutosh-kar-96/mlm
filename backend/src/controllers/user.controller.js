import * as userService from "../services/user.service.js";
import { subscribeGpg as subscribeGpgService } from "../services/rank.service.js";
import { success } from "../utils/apiResponse.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    success(res, await userService.register(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    success(res, await userService.login(req.body));
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    success(res, await userService.refreshToken(req.body));
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    success(res, await userService.me(req.user));
  } catch (err) {
    next(err);
  }
};

export const dashboard = async (req, res, next) => {
  try {
    success(res, await userService.dashboard(req.user));
  } catch (err) {
    next(err);
  }
};

export const wallet = async (req, res, next) => {
  try {
    success(res, await userService.wallet(req.user));
  } catch (err) {
    next(err);
  }
};

export const payouts = async (req, res, next) => {
  try {
    success(res, await userService.payouts(req.user));
  } catch (err) {
    next(err);
  }
};

export const createWithdrawal = async (req, res, next) => {
  try {
    success(res, await userService.createWithdrawal(req.user, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const network = async (req, res, next) => {
  try {
    success(res, await userService.network(req.user));
  } catch (err) {
    next(err);
  }
};

export const packages = async (req, res, next) => {
  try {
    success(res, await userService.packages());
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    success(res, await userService.updateMyProfile(req.user, req.body));
  } catch (err) {
    next(err);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    success(res, await userService.changeMyPassword(req.user, req.body));
  } catch (err) {
    next(err);
  }
};

export const submitKyc = async (req, res, next) => {
  try {
    success(res, await userService.submitKyc(req.user, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const orders = async (req, res, next) => {
  try {
    success(res, await userService.orders(req.user));
  } catch (err) {
    next(err);
  }
};

export const commissions = async (req, res, next) => {
  try {
    success(res, await userService.myCommissions(req.user, req.query));
  } catch (err) {
    next(err);
  }
};

export const mlmSummary = async (req, res, next) => {
  try {
    success(res, await userService.mlmSummary(req.user));
  } catch (err) {
    next(err);
  }
};

export const subscribeGpg = async (req, res, next) => {
  try {
    success(res, await subscribeGpgService(req.user?.regno, req.body), 201);
  } catch (err) {
    next(err);
  }
};
