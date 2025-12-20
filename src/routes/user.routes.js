import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { auth } from "#middlewares/auth";

const router = Router();

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", auth, asyncHandler(UserController.getById));

export default router;
