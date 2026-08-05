import * as supportService from "../services/support.service.js";
import { success } from "../utils/apiResponse.js";

export const helpDesk = async (req, res, next) => {
  try {
    success(res, await supportService.listHelpDesk({
      ...req.query,
      ...(req.user?.role === "user" ? { regno: req.user.regno } : {}),
    }));
  } catch (err) {
    next(err);
  }
};

export const createHelpDesk = async (req, res, next) => {
  try {
    success(res, await supportService.createHelpDesk({ ...req.body, regno: req.user?.regno }), 201);
  } catch (err) {
    next(err);
  }
};

export const replyHelpDesk = async (req, res, next) => {
  try {
    success(res, await supportService.replyHelpDesk(req.params.id, req.user?.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const deleteHelpDesk = async (req, res, next) => {
  try {
    success(res, await supportService.deleteHelpDesk(req.params.id));
  } catch (err) {
    next(err);
  }
};

export const dashboardMessages = async (req, res, next) => {
  try {
    success(res, await supportService.listDashboardMessages());
  } catch (err) {
    next(err);
  }
};

export const createDashboardMessage = async (req, res, next) => {
  try {
    success(res, await supportService.createDashboardMessage(req.user?.id, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const updateDashboardMessageStatus = async (req, res, next) => {
  try {
    success(res, await supportService.setDashboardMessageStatus(req.params.id, req.body.active));
  } catch (err) {
    next(err);
  }
};
