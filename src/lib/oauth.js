import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import { config } from "#config/env";
import { logger } from "#lib/logger";

const GoogleOAuth2Strategy = GoogleStrategy.Strategy;
const GitHubOAuth2Strategy = GitHubStrategy.Strategy;

/**
 * Initialise les stratégies OAuth (Google et GitHub***REMOVED*** avec Passport
 * Gère la sérialisation/désérialisation des utilisateurs
 */
export function initializePassportStrategies(***REMOVED*** {
  // Sérialisation: stocker l'ID utilisateur en session
  passport.serializeUser((user, done***REMOVED*** => {
    done(null, user.id***REMOVED***;
  }***REMOVED***;

  // Désérialisation: récupérer l'utilisateur par son ID (optionnel, utilisé si sessions***REMOVED***
  passport.deserializeUser((id, done***REMOVED*** => {
    done(null, { id }***REMOVED***;
  }***REMOVED***;

  // Stratégie Google OAuth2
  passport.use(
    new GoogleOAuth2Strategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.APP_URL}/api/oauth/google/callback`,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done***REMOVED*** => {
        logger.info(`Google OAuth callback received for profile: ${profile.id}`***REMOVED***;
        
        // On retourne le profil OAuth pour traitement dans le contrôleur
        return done(null, {
          id: profile.id,
          provider: "google",
          profile: profile,
          accessToken,
          refreshToken,
        }***REMOVED***;
      }
    ***REMOVED***
  ***REMOVED***;

  // Stratégie GitHub OAuth2
  passport.use(
    new GitHubOAuth2Strategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: `${config.APP_URL}/api/oauth/github/callback`,
        passReqToCallback: true,
        scope : ["user.email"]
      },``
      (req, accessToken, refreshToken, profile, done***REMOVED*** => {
        logger.info(`GitHub OAuth callback received for profile: ${profile.id}`***REMOVED***;
        
        // On retourne le profil OAuth pour traitement dans le contrôleur
        return done(null, {
          id: profile.id,
          provider: "github",
          profile: profile,
          accessToken,
          refreshToken,
        }***REMOVED***;
      }
    ***REMOVED***
  ***REMOVED***;

  logger.info("Passport strategies initialized (Google + GitHub***REMOVED***"***REMOVED***;
}

/**
 * Exporte l'instance Passport configurée pour utilisation dans les routes et middlewares
 */
export default passport;
