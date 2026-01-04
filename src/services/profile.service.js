import prisma from '#lib/prisma';
import { NotFoundException } from '#lib/exceptions';

export class ProfileService {
  /**
   * Obtenir les statistiques du profil
   */
  static async getProfileStats(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            refreshTokens: true,
            oauthAccounts: true,
            loginHistories: true,
          },
        },
        refreshTokens: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { revokedAt: null },
          select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      sessions: user._count.refreshTokens,
      oauthConnections: user._count.oauthAccounts,
      loginHistory: user._count.loginHistories,
      recentSessions: user.refreshTokens,
      accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
    };
  }
}