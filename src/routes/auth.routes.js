import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";

const router = Router(***REMOVED***;

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register***REMOVED******REMOVED***;
router.post("/login", asyncHandler(UserController.login***REMOVED******REMOVED***;

export default router;
