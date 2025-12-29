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
import { config } from "#config/env";

const app = express(***REMOVED***;
const PORT = config.PORT || 3000;

// Middlewares
app.use(helmet(***REMOVED******REMOVED***;
app.use(cors(***REMOVED******REMOVED***;
app.use(httpLogger***REMOVED***;
app.use(express.json(***REMOVED******REMOVED***;
// Configuration pour récupérer l'IP réelle (nécessaire pour proxy/load balancer***REMOVED***
app.set('trust proxy', true***REMOVED***;

// Routes
app.get("/", (req, res***REMOVED*** => {
  res.json({ success: true, message: "API Express opérationnelle" }***REMOVED***;
}***REMOVED***;

// Utilisation des routes
app.use("/api/auth", authRouter***REMOVED***;
app.use("/api/users", userRouter***REMOVED***;

// 404 handler
app.use(notFoundHandler***REMOVED***;

// Global error handler
app.use(errorHandler***REMOVED***;

app.listen(PORT, (***REMOVED*** => {
  logger.info(`Serveur démarré sur <http://localhost>:${PORT}`***REMOVED***;
}***REMOVED***;
