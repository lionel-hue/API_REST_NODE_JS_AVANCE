import { Router } from "express";
import { AuthController } from "#controllers/auth.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";
import { authLimiter } from "#middlewares/rate-limit"; // <-- Ajoutez cette ligne

const router = Router();

// Routes publiques avec rate limiting
router.post("/register", authLimiter, asyncHandler(AuthController.register)); // <-- Ajoutez authLimiter
router.post("/login", authLimiter, asyncHandler(AuthController.login)); // <-- Ajoutez authLimiter
router.post("/refresh", asyncHandler(AuthController.refresh));

// Routes protégées (nécessitent authentification)
router.post("/logout", auth, asyncHandler(AuthController.logout));

export default router;