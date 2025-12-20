import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config(***REMOVED***;

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import userRouter from "#routes/user.routes";

const app = express(***REMOVED***;
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet(***REMOVED******REMOVED***;
app.use(cors(***REMOVED******REMOVED***;
app.use(httpLogger***REMOVED***;
app.use(express.json(***REMOVED******REMOVED***;

// Routes
app.get("/", (req, res***REMOVED*** => {
  res.json({ success: true, message: "API Express opérationnelle" }***REMOVED***;
}***REMOVED***;

// Utilisation des routes
app.use("/users", userRouter***REMOVED***;
app.use("/", userRouter***REMOVED***; // Pour garder /register et /login à la racine

// 404 handler
app.use(notFoundHandler***REMOVED***;

// Global error handler
app.use(errorHandler***REMOVED***;

app.listen(PORT, (***REMOVED*** => {
  logger.info(`Serveur démarré sur <http://localhost>:${PORT}`***REMOVED***;
}***REMOVED***;
