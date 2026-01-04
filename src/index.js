import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import { auth } from "#middlewares/auth";
import userRouter from "#routes/user.routes";
import authRouter from "#routes/auth.routes";
import oauthRouter from "#routes/oauth.routes";
import emailRouter from "#routes/email.routes";
import passwordRouter from "#routes/password.routes";
import sessionRouter from "#routes/session.routes";
import twoFactorRouter from "#routes/two-factor.routes";
import profileRouter from "#routes/profile.routes"; // AJOUT IMPORT
import { config } from "#config/env";
import passport, { initializePassportStrategies } from "#lib/oauth";

const app = express();
const PORT = config.PORT || 3000;

// Initialiser les stratégies Passport OAuth
initializePassportStrategies();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Configuration pour récupérer l'IP réelle (nécessaire pour proxy/load balancer)
app.set('trust proxy', true);

// Initialiser Passport
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// Utilisation des routes
app.use("/api/auth", authRouter);
app.use("/api/auth", emailRouter);
app.use("/api/password", passwordRouter);
app.use("/api/users", userRouter);
app.use("/api/oauth", oauthRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/2fa", twoFactorRouter);
app.use("/api/profile", profileRouter); // DÉPLACÉ ICI

// 404 handler - DOIT ÊTRE APRÈS TOUTES LES ROUTES
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
});