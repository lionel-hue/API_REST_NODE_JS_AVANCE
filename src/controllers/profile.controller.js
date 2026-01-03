import prisma from '#lib/prisma';
import { UnauthorizedException, NotFoundException, BadRequestException } from '#lib/exceptions';
import { validateData } from '#lib/validate';
import { hashPassword, verifyPassword } from '#lib/password';

// Schéma de validation pour la mise à jour du profil
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string(***REMOVED***.min(1, 'Le prénom est requis'***REMOVED***.optional(***REMOVED***,
  lastName: z.string(***REMOVED***.min(1, 'Le nom est requis'***REMOVED***.optional(***REMOVED***,
  email: z.string(***REMOVED***.email('Email invalide'***REMOVED***.optional(***REMOVED***,
  currentPassword: z.string(***REMOVED***.min(1, 'Mot de passe actuel requis pour changer l\'email'***REMOVED***.optional(***REMOVED***,
}***REMOVED***;

const deleteAccountSchema = z.object({
  password: z.string(***REMOVED***.min(1, 'Mot de passe requis pour supprimer le compte'***REMOVED***,
  confirm: z.string(***REMOVED***.min(1, 'Confirmation requise'***REMOVED***,
}***REMOVED***.refine(data => data.password === data.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
}***REMOVED***;

export class ProfileController {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /api/profile
   */
  static async getProfile(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        throw new UnauthorizedException('Authentication required'***REMOVED***;
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
      }***REMOVED***;

      if (!user***REMOVED*** {
        throw new NotFoundException('User not found'***REMOVED***;
      }

      res.json({
        success: true,
        profile: {
          ...user,
          hasPassword: true, // Vous devrez vérifier si l'utilisateur a un mot de passe
          providers: user.oauthAccounts.map(acc => acc.provider***REMOVED***,
        },
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error getting profile: ${error.message}`***REMOVED***;
      throw error;
    }
  }

  /**
   * Mettre à jour le profil
   * PUT /api/profile
   */
  static async updateProfile(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        throw new UnauthorizedException('Authentication required'***REMOVED***;
      }

      const validatedData = validateData(updateProfileSchema, req.body***REMOVED***;

      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password: true },
      }***REMOVED***;

      if (!user***REMOVED*** {
        throw new NotFoundException('User not found'***REMOVED***;
      }

      // Si changement d'email, vérifier le mot de passe
      if (validatedData.email && validatedData.email !== user.email***REMOVED*** {
        if (!validatedData.currentPassword***REMOVED*** {
          throw new BadRequestException('Current password is required to change email'***REMOVED***;
        }

        // Vérifier le mot de passe actuel
        const isPasswordValid = await verifyPassword(user.password, validatedData.currentPassword***REMOVED***;
        if (!isPasswordValid***REMOVED*** {
          throw new BadRequestException('Current password is incorrect'***REMOVED***;
        }

        // Vérifier si le nouvel email est déjà utilisé
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        }***REMOVED***;

        if (existingUser && existingUser.id !== userId***REMOVED*** {
          throw new BadRequestException('Email already in use'***REMOVED***;
        }

        // Réinitialiser la vérification d'email
        validatedData.emailVerifiedAt = null;
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.firstName && { firstName: validatedData.firstName }***REMOVED***,
          ...(validatedData.lastName && { lastName: validatedData.lastName }***REMOVED***,
          ...(validatedData.email && { 
            email: validatedData.email,
            emailVerifiedAt: null, // Réinitialiser la vérification
          }***REMOVED***,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerifiedAt: true,
          updatedAt: true,
        },
      }***REMOVED***;

      // Si email changé, envoyer un email de vérification
      if (validatedData.email && validatedData.email !== user.email***REMOVED*** {
        // Vous devrez implémenter l'envoi d'email de vérification ici
        console.log(`Email changed to ${validatedData.email}, verification email should be sent`***REMOVED***;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedUser,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error updating profile: ${error.message}`***REMOVED***;
      throw error;
    }
  }

  /**
   * Supprimer le compte (soft delete***REMOVED***
   * DELETE /api/profile
   */
  static async deleteAccount(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        throw new UnauthorizedException('Authentication required'***REMOVED***;
      }

      const validatedData = validateData(deleteAccountSchema, req.body***REMOVED***;

      // Vérifier l'utilisateur et son mot de passe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password: true },
      }***REMOVED***;

      if (!user***REMOVED*** {
        throw new NotFoundException('User not found'***REMOVED***;
      }

      // Vérifier le mot de passe
      const isPasswordValid = await verifyPassword(user.password, validatedData.password***REMOVED***;
      if (!isPasswordValid***REMOVED*** {
        throw new BadRequestException('Password is incorrect'***REMOVED***;
      }

      // Soft delete : marquer comme désactivé
      await prisma.user.update({
        where: { id: userId },
        data: {
          disabledAt: new Date(***REMOVED***,
        },
      }***REMOVED***;

      // Supprimer tous les refresh tokens (déconnexion de tous les appareils***REMOVED***
      await prisma.refreshToken.deleteMany({
        where: { userId },
      }***REMOVED***;

      // Blacklister tous les access tokens actuels
      // Note: Vous aurez besoin d'un système pour tracker les tokens actifs

      res.json({
        success: true,
        message: 'Account deleted successfully. You can recover your account within 30 days.',
        note: 'Contact support to recover your account.',
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error deleting account: ${error.message}`***REMOVED***;
      throw error;
    }
  }
}