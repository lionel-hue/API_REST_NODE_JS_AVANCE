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
import { config } from "#config/env";

const app = express();
const PORT = config.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());
// Configuration pour récupérer l'IP réelle (nécessaire pour proxy/load balancer)
app.set('trust proxy', true);

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// Utilisation des routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur <http://localhost>:${PORT}`);
});
