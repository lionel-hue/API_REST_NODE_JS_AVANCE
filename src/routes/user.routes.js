import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";

const router = Router(***REMOVED***;

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll***REMOVED******REMOVED***;
router.get("/:id", auth, asyncHandler(UserController.getById***REMOVED******REMOVED***;

export default router;
