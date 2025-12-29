import { Router } from "express";
import { AuthController } from "#controllers/auth.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";

const router = Router(***REMOVED***;

// Routes publiques
router.post("/register", asyncHandler(AuthController.register***REMOVED******REMOVED***;
router.post("/login", asyncHandler(AuthController.login***REMOVED******REMOVED***;
router.post("/refresh", asyncHandler(AuthController.refresh***REMOVED******REMOVED***;

// Routes protégées (nécessitent authentification***REMOVED***
router.post("/logout", auth, asyncHandler(AuthController.logout***REMOVED******REMOVED***;

export default router;
