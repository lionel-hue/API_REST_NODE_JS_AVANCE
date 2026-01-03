import { Router } from "express";
import { AuthController } from "#controllers/auth.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";
import { authLimiter } from "#middlewares/rate-limit"; // <-- Ajoutez cette ligne

const router = Router(***REMOVED***;

// Routes publiques avec rate limiting
router.post("/register", authLimiter, asyncHandler(AuthController.register***REMOVED******REMOVED***; // <-- Ajoutez authLimiter
router.post("/login", authLimiter, asyncHandler(AuthController.login***REMOVED******REMOVED***; // <-- Ajoutez authLimiter
router.post("/refresh", asyncHandler(AuthController.refresh***REMOVED******REMOVED***;

// Routes protégées (nécessitent authentification***REMOVED***
router.post("/logout", auth, asyncHandler(AuthController.logout***REMOVED******REMOVED***;

export default router;