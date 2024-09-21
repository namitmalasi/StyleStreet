import express from "express";
import {
  logout,
  refreshToken,
  signin,
  signup,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

export default router;
