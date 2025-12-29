import { Router } from "express";
import { AuthController } from "#controllers/auth.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";

const router = Router();

// Routes publiques
router.post("/register", asyncHandler(AuthController.register));
router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));

// Routes protégées (nécessitent authentification)
router.post("/logout", auth, asyncHandler(AuthController.logout));

export default router;
