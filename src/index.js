import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config(***REMOVED***;

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import { auth } from "#middlewares/auth";
import userRouter from "#routes/user.routes";
import authRouter from "#routes/auth.routes";
import oauthRouter from "#routes/oauth.routes";
import emailRouter from "#routes/email.routes"; // Add this
import passwordRouter from "#routes/password.routes"; // Add this
import { config } from "#config/env";
import passport, { initializePassportStrategies } from "#lib/oauth";

const app = express(***REMOVED***;
const PORT = config.PORT || 3000;

// Initialiser les stratégies Passport OAuth
initializePassportStrategies(***REMOVED***;

// Middlewares
app.use(helmet(***REMOVED******REMOVED***;
app.use(cors(***REMOVED******REMOVED***;
app.use(httpLogger***REMOVED***;
app.use(express.json(***REMOVED******REMOVED***;
// Configuration pour récupérer l'IP réelle (nécessaire pour proxy/load balancer***REMOVED***
app.set('trust proxy', true***REMOVED***;

// Initialiser Passport
app.use(passport.initialize(***REMOVED******REMOVED***;

// Routes
app.get("/", (req, res***REMOVED*** => {
  res.json({ success: true, message: "API Express opérationnelle" }***REMOVED***;
}***REMOVED***;

// Utilisation des routes
app.use("/api/auth", authRouter***REMOVED***;
app.use("/api/auth", emailRouter***REMOVED***; // Add email routes under /api/auth
app.use("/api/password", passwordRouter***REMOVED***; // Add password routes
app.use("/api/users", userRouter***REMOVED***;
app.use("/api/oauth", oauthRouter***REMOVED***;

// 404 handler
app.use(notFoundHandler***REMOVED***;

// Global error handler
app.use(errorHandler***REMOVED***;

app.listen(PORT, (***REMOVED*** => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`***REMOVED***;
}***REMOVED***;