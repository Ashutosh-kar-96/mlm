import * as rankService from "../services/rank.service.js";
import { commissions as listCommissions } from "../services/mlm.service.js";
import { success } from "../utils/apiResponse.js";

export const history = async (req, res, next) => {
  try {
    success(res, await rankService.history(req.query));
  } catch (err) {
    next(err);
  }
};

export const upgrade = async (req, res, next) => {
  try {
    success(res, await rankService.upgrade(req.body, req.user?.id), 201);
  } catch (err) {
    next(err);
  }
};

export const commissions = async (req, res, next) => {
  try {
    success(res, { items: await listCommissions(req.query) });
  } catch (err) {
    next(err);
  }
};

export const plan = async (req, res, next) => {
  try {
    success(res, await rankService.planSummary());
  } catch (err) {
    next(err);
  }
};

export const rewards = async (req, res, next) => {
  try {
    success(res, await rankService.rewards(req.query));
  } catch (err) {
    next(err);
  }
};

export const updateReward = async (req, res, next) => {
  try {
    success(res, await rankService.updateRewardClaim(req.params.id, req.body, req.user?.id));
  } catch (err) {
    next(err);
  }
};

export const gpgSubscriptions = async (req, res, next) => {
  try {
    success(res, await rankService.gpgSubscriptions(req.query));
  } catch (err) {
    next(err);
  }
};

export const updateGpgApproval = async (req, res, next) => {
  try {
    success(res, await rankService.updateGpgApproval(req.params.id, req.body, req.user?.id));
  } catch (err) {
    next(err);
  }
};

export const autoAssignGpg = async (req, res, next) => {
  try {
    success(res, await rankService.autoAssignGpg(req.body, req.user?.id));
  } catch (err) {
    next(err);
  }
};

export const licenseUsages = async (req, res, next) => {
  try {
    success(res, await rankService.licenseUsages(req.query));
  } catch (err) {
    next(err);
  }
};

export const rankChallenges = async (req, res, next) => {
  try {
    success(res, await rankService.rankChallenges(req.query));
  } catch (err) {
    next(err);
  }
};
