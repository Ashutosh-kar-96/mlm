import * as commerceService from "../services/commerce.service.js";
import { success } from "../utils/apiResponse.js";

export const products = async (req, res, next) => {
  try {
    success(res, await commerceService.listProducts(req.query));
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    success(res, await commerceService.createProduct(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    success(res, await commerceService.updateProduct(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const cart = async (req, res, next) => {
  try {
    success(res, await commerceService.cart(req.user.regno));
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    success(res, await commerceService.addToCart(req.user.regno, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    success(res, await commerceService.updateCartItem(req.user.regno, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    success(res, await commerceService.removeCartItem(req.user.regno, req.params.id));
  } catch (err) {
    next(err);
  }
};

export const checkout = async (req, res, next) => {
  try {
    success(res, await commerceService.checkout(req.user.regno, req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const walletLedger = async (req, res, next) => {
  try {
    success(res, await commerceService.walletLedger(req.user.regno, req.query));
  } catch (err) {
    next(err);
  }
};

export const addFund = async (req, res, next) => {
  try {
    success(res, await commerceService.addFund(req.user.regno, req.body), 201);
  } catch (err) {
    next(err);
  }
};
