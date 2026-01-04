import prisma from '#lib/prisma';
import { UnauthorizedException, NotFoundException, BadRequestException } from '#lib/exceptions';
import { validateData } from '#lib/validate';
import { hashPassword, verifyPassword } from '#lib/password';

// Schéma de validation pour la mise à jour du profil
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').optional(),
  lastName: z.string().min(1, 'Le nom est requis').optional(),
  email: z.string().email('Email invalide').optional(),
  currentPassword: z.string().min(1, 'Mot de passe actuel requis pour changer l\'email').optional(),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis pour supprimer le compte'),
  confirm: z.string().min(1, 'Confirmation requise'),
}).refine(data => data.password === data.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
});

export class ProfileController {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /api/profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        throw new UnauthorizedException('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          disabledAt: true,
          oauthAccounts: {
            select: {
              provider: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      res.json({
        success: true,
        profile: {
          ...user,
          hasPassword: true, // Vous devrez vérifier si l'utilisateur a un mot de passe
          providers: user.oauthAccounts.map(acc => acc.provider),
        },
      });
    } catch (error) {
      console.error(`Error getting profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mettre à jour le profil
   * PUT /api/profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        throw new UnauthorizedException('Authentication required');
      }

      const validatedData = validateData(updateProfileSchema, req.body);

      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Si changement d'email, vérifier le mot de passe
      if (validatedData.email && validatedData.email !== user.email) {
        if (!validatedData.currentPassword) {
          throw new BadRequestException('Current password is required to change email');
        }

        // Vérifier le mot de passe actuel
        const isPasswordValid = await verifyPassword(user.password, validatedData.currentPassword);
        if (!isPasswordValid) {
          throw new BadRequestException('Current password is incorrect');
        }

        // Vérifier si le nouvel email est déjà utilisé
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (existingUser && existingUser.id !== userId) {
          throw new BadRequestException('Email already in use');
        }

        // Réinitialiser la vérification d'email
        validatedData.emailVerifiedAt = null;
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.firstName && { firstName: validatedData.firstName }),
          ...(validatedData.lastName && { lastName: validatedData.lastName }),
          ...(validatedData.email && { 
            email: validatedData.email,
            emailVerifiedAt: null, // Réinitialiser la vérification
          }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerifiedAt: true,
          updatedAt: true,
        },
      });

      // Si email changé, envoyer un email de vérification
      if (validatedData.email && validatedData.email !== user.email) {
        // Vous devrez implémenter l'envoi d'email de vérification ici
        console.log(`Email changed to ${validatedData.email}, verification email should be sent`);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedUser,
      });
    } catch (error) {
      console.error(`Error updating profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer le compte (soft delete)
   * DELETE /api/profile
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        throw new UnauthorizedException('Authentication required');
      }

      const validatedData = validateData(deleteAccountSchema, req.body);

      // Vérifier l'utilisateur et son mot de passe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await verifyPassword(user.password, validatedData.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Password is incorrect');
      }

      // Soft delete : marquer comme désactivé
      await prisma.user.update({
        where: { id: userId },
        data: {
          disabledAt: new Date(),
        },
      });

      // Supprimer tous les refresh tokens (déconnexion de tous les appareils)
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      // Blacklister tous les access tokens actuels
      // Note: Vous aurez besoin d'un système pour tracker les tokens actifs

      res.json({
        success: true,
        message: 'Account deleted successfully. You can recover your account within 30 days.',
        note: 'Contact support to recover your account.',
      });
    } catch (error) {
      console.error(`Error deleting account: ${error.message}`);
      throw error;
    }
  }
}