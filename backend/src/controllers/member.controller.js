import * as memberService from "../services/member.service.js";
import { success } from "../utils/apiResponse.js";

export const listMembers = (type) => async (req, res, next) => {
  try {
    success(res, await memberService.listMembers(req.query, type || req.query.status));
  } catch (err) {
    next(err);
  }
};

export const getMember = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin" && req.params.regno !== req.user?.regno) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this member" });
    }
    const member = await memberService.getMember(req.params.regno);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    success(res, member);
  } catch (err) {
    next(err);
  }
};

export const createMember = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin" && req.body.sponsorId !== req.user?.regno) {
      return res.status(403).json({ success: false, message: "You can only register members under your own sponsor ID" });
    }
    success(res, await memberService.createMember(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    success(res, await memberService.updateMember(req.params.regno, req.body));
  } catch (err) {
    next(err);
  }
};

export const activateMember = async (req, res, next) => {
  try {
    success(res, await memberService.setStatus(req.params.regno, 1, req.user?.role === "admin" ? req.user.id : undefined));
  } catch (err) {
    next(err);
  }
};

export const blockMember = async (req, res, next) => {
  try {
    success(res, await memberService.setStatus(req.params.regno, 2, req.user?.role === "admin" ? req.user.id : undefined));
  } catch (err) {
    next(err);
  }
};

export const unblockMember = async (req, res, next) => {
  try {
    success(res, await memberService.setStatus(req.params.regno, 0, req.user?.role === "admin" ? req.user.id : undefined));
  } catch (err) {
    next(err);
  }
};

export const updateMemberStatus = async (req, res, next) => {
  try {
    const statusMap = { unpaid: 0, active: 1, blocked: 2 };
    const status = statusMap[req.body.status] ?? req.body.status;
    success(res, await memberService.setStatus(req.params.regno, Number(status), req.user?.role === "admin" ? req.user.id : undefined));
  } catch (err) {
    next(err);
  }
};

export const creditWallet = async (req, res, next) => {
  try {
    success(res, await memberService.creditWallet(req.params.regno, req.body, req.user?.id), 201);
  } catch (err) {
    next(err);
  }
};

export const getDownline = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin" && req.params.regno !== req.user?.regno) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this downline" });
    }
    success(res, await memberService.getDownline(req.params.regno, req.query));
  } catch (err) {
    next(err);
  }
};

export const ranks = async (req, res, next) => {
  try {
    success(res, await memberService.listRanks());
  } catch (err) {
    next(err);
  }
};
