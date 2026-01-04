import { Router } from 'express';
import { ProfileController } from '#controllers/profile.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';

const router = Router();

// Toutes les routes de profil nécessitent une authentification
router.use(auth);

// GET /api/profile - Récupérer le profil
router.get('/', asyncHandler(ProfileController.getProfile));

// PUT /api/profile - Mettre à jour le profil
router.put('/', asyncHandler(ProfileController.updateProfile));

// DELETE /api/profile - Supprimer le compte
router.delete('/', asyncHandler(ProfileController.deleteAccount));

export default router;