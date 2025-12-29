import { AuthService } from "#services/auth.service";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema, refreshTokenSchema } from "#schemas/auth.schema";

export class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  static async register(req, res) {
    const validatedData = validateData(registerSchema, req.body);
    const userAgent = req.headers["user-agent"] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    const result = await AuthService.register(
      validatedData,
      userAgent,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        createdAt: result.user.createdAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  /**
   * Connexion d'un utilisateur
   * POST /api/auth/login
   */
  static async login(req, res) {
    const validatedData = validateData(loginSchema, req.body);
    const userAgent = req.headers["user-agent"] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    const result = await AuthService.login(
      validatedData.email,
      validatedData.password,
      userAgent,
      ipAddress
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        createdAt: result.user.createdAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  /**
   * Déconnexion d'un utilisateur
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader?.split(" ")[1];
    const { refreshToken } = req.body || {};
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    await AuthService.logout(accessToken, refreshToken, userId);

    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  }

  /**
   * Rafraîchir les tokens
   * POST /api/auth/refresh
   */
  static async refresh(req, res) {
    const validatedData = validateData(refreshTokenSchema, req.body);
    const userAgent = req.headers["user-agent"] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    const result = await AuthService.refresh(
      validatedData.refreshToken,
      userAgent,
      ipAddress
    );

    res.json({
      success: true,
      message: "Tokens rafraîchis avec succès",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }
}

