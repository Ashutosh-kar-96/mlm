import * as pinService from "../services/pin.service.js";
import { success } from "../utils/apiResponse.js";

export const plans = async (req, res, next) => {
  try {
    success(res, await pinService.plans());
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    success(res, await pinService.createPlan(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    success(res, await pinService.updatePlan(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const generate = async (req, res, next) => {
  try {
    success(res, await pinService.generatePins(req.body, req.user?.id), 201);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    success(res, await pinService.listPins(req.query));
  } catch (err) {
    next(err);
  }
};

export const activate = async (req, res, next) => {
  try {
    success(res, await pinService.setActive(req.body.ids || [], true));
  } catch (err) {
    next(err);
  }
};

export const deactivate = async (req, res, next) => {
  try {
    success(res, await pinService.setActive(req.body.ids || [], false));
  } catch (err) {
    next(err);
  }
};

export const transfer = async (req, res, next) => {
  try {
    success(res, await pinService.transferPins(req.body, req.user?.id));
  } catch (err) {
    next(err);
  }
};

export const usePin = async (req, res, next) => {
  try {
    const body = req.user?.role === "admin"
      ? req.body
      : {
          ...req.body,
          usedByRegno: req.user?.regno,
          usedForRegno: req.body.usedForRegno || req.user?.regno,
        };
    success(res, await pinService.usePin(body, req.user?.role), 201);
  } catch (err) {
    next(err);
  }
};

export const transfers = async (req, res, next) => {
  try {
    success(res, await pinService.transfers(req.query));
  } catch (err) {
    next(err);
  }
};

export const used = async (req, res, next) => {
  try {
    success(res, await pinService.usedPins(req.query));
  } catch (err) {
    next(err);
  }
};
