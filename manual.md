# NodeJS + Express

# Guide d'installation - Projet Express.js Avancé

## Prérequis

- Node.js v22+ installé
- npm
- [Yaak](https://yaak.app/)

---

## 1. Initialisation du projet

```bash
mkdir express-tp
cd express-tp
npm init -y

```

Modifier `package.json` :

```json
{
  "name": "express-tp",
  "version": "1.0.0",
  "type": "module",
  "imports": {
    "#lib/*": "./src/lib/*.js",
    "#controllers/*": "./src/controllers/*.js",
    "#services/*": "./src/services/*.js",
    "#middlewares/*": "./src/middlewares/*.js",
    "#routes/*": "./src/routes/*.js",
    "#schemas/*": "./src/schemas/*.js",
    "#dto/*": "./src/dto/*.js"
  },
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "better-sqlite3",
      "argon2"
    ]
  }

}

```

> Note : --watch est natif depuis Node.js 18+, plus besoin de nodemon.
> 

---

## 2. Installation des dépendances

### Dépendances principales

```bash
npm install express cors helmet dotenv zod pino pino-http pino-pretty jose argon2 @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3

```

| Package | Description |
| --- | --- |
| `express` | Framework web |
| `cors` | Gestion des requêtes cross-origin |
| `helmet` | Sécurité HTTP headers |
| `dotenv` | Variables d'environnement |
| `zod` | Validation de schémas |
| `pino` | Logger haute performance |
| `pino-http` | Middleware de logging HTTP |
| `pino-pretty` | Formatage des logs en dev |
| `jose` | JWT (signatures, chiffrement) |
| `argon2` | Hachage sécurisé des mots de passe |
| `@prisma/client` | Client Prisma pour la BDD |
| `@prisma/adapter-better-sqlite3` | Adapter SQLite pour Prisma |
| `better-sqlite3` | Driver SQLite natif |

### Dépendances de développement

```bash
npm install -D prisma

```

---

## 3. Configuration Prisma

Initialiser Prisma avec SQLite :

```bash
npx prisma init --datasource-provider sqlite --output ../generated/prisma

```

Cela crée :

- `prisma/schema.prisma` - schéma de la base de données
- `.env` - fichier d'environnement
- `prisma.config.ts` - configuration Prisma (à supprimer)

Supprimer le fichier TypeScript et créer la version JavaScript :

```bash
rm prisma.config.ts
touch prisma.config.js

```

### `prisma.config.js`

```jsx
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})

```

> Ce fichier configure Prisma pour utiliser le nouveau système de configuration.
> 

---

## 4. Schéma Prisma

Remplacer le contenu de `prisma/schema.prisma` :

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

> Le output spécifie où le client Prisma sera généré.
> 

---

## 5. Structure du projet

```
express-course/
├── prisma/                  # Configuration de la base de données
│   ├── schema.prisma        # Structure de vos données (modèles)
│   └── dev.db               # Le fichier de base de données (SQLite)
├── src/                     # Le code source de votre application
│   ├── controllers/         # Les chefs d'orchestre : reçoivent les requêtes et répondent
│   │   └── user.controller.js
│   ├── dto/                 # Filtres de données : choisissent ce qu'on envoie au client
│   │   └── user.dto.js
│   ├── lib/                 # Boîte à outils : fonctions utilitaires partagées
│   │   ├── async-handler.js
│   │   ├── exceptions.js    # Gestion des erreurs personnalisées
│   │   ├── jwt.js           # Gestion des jetons de connexion
│   │   ├── logger.js        # Pour afficher des messages propres dans la console
│   │   ├── password.js      # Pour sécuriser les mots de passe
│   │   ├── prisma.js        # Connexion à la base de données
│   │   └── validate.js      # Logique de validation des données
│   ├── middlewares/         # Filtres de passage : s'exécutent avant les routes
│   │   ├── error-handler.js # Le filet de sécurité pour toutes les erreurs
│   │   └── not-found.js     # Gère les routes qui n'existent pas
│   ├── routes/              # Les adresses (points d'entrée) de votre API
│   │   └── user.routes.js
│   ├── schemas/             # Définition des règles de validation (Zod)
│   │   └── user.schema.js
│   ├── services/            # Les ouvriers : font le vrai travail (calculs, BDD)
│   │   └── user.service.js
│   └── index.js             # Le point de départ du serveur
├── .env                     # Vos secrets et configurations (ne pas partager !)
└── package.json             # Liste des outils et scripts du projet

```

Créer la structure :

```bash
# Linux
mkdir -p src/{controllers,dto,lib,middlewares,routes,schemas,services}
touch src/index.js
touch src/lib/{prisma,logger,jwt,password,async-handler,exceptions,validate}.js
touch src/middlewares/{error-handler,not-found}.js
touch src/schemas/user.schema.js
touch src/controllers/user.controller.js
touch src/services/user.service.js
touch src/routes/user.routes.js
touch src/dto/user.dto.js
touch .gitignore

# Windows CMD
mkdir src\\controllers src\\dto src\\lib src\\middlewares src\\routes src\\schemas src\\services
type nul > src\\index.js
type nul > src\\lib\\prisma.js
type nul > src\\lib\\logger.js
type nul > src\\lib\\jwt.js
type nul > src\\lib\\password.js
type nul > src\\lib\\async-handler.js
type nul > src\\lib\\exceptions.js
type nul > src\\lib\\validate.js
type nul > src\\middlewares\\error-handler.js
type nul > src\\middlewares\\not-found.js
type nul > src\\schemas\\user.schema.js
type nul > src\\controllers\\user.controller.js
type nul > src\\services\\user.service.js
type nul > src\\routes\\user.routes.js
type nul > src\\dto\\user.dto.js
type nul > .gitignore

```

---

## 6. Fichiers de configuration

### `.gitignore`

```
node_modules
.env
prisma/dev.db
prisma/dev.db-journal
generated

```

### `.env`

```
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=votre_secret_jwt_de_32_caracteres_minimum

```

---

## 7. Fichiers utilitaires

### `src/lib/prisma.js`

```jsx
import "dotenv/config";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaBetterSQLite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;

```

> L'adapter permet à Prisma de communiquer avec SQLite via better-sqlite3. C'est le "pont" entre votre code et le fichier de base de données.
> 

### `src/lib/logger.js`

```jsx
import pino from "pino";
import pinoHttp from "pino-http";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true },
      },
});

export const httpLogger = pinoHttp({ logger });

```

> Pino est un outil qui affiche des messages dans votre terminal. C'est beaucoup plus puissant que console.log car il permet de classer les messages par importance (info, warn, error).
> 

### `src/lib/jwt.js`

```jsx
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = "HS256";

export async function signToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
```

> Un JWT est une sorte de "badge d'accès" numérique. Une fois connecté, l'utilisateur présente ce badge à chaque requête pour prouver son identité sans avoir à redonner son mot de passe.
> 

### `src/lib/password.js`

```jsx
import argon2 from "argon2";

export async function hashPassword(password) {
  return argon2.hash(password);
}

export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}
```

> On ne stocke JAMAIS un mot de passe en clair dans une base de données. Argon2 transforme le mot de passe en une chaîne illisible (le "hash") pour que, même si la base de données est volée, les mots de passe restent secrets.
> 

### `src/lib/exceptions.js`

```jsx
export class HttpException extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request", details = null) {
    super(400, message, details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class ValidationException extends HttpException {
  constructor(errors) {
    super(400, "Validation Failed", errors);
  }
}

```

> Ces classes servent à signaler des erreurs spécifiques (ex: 404 si rien n'est trouvé, 401 si le mot de passe est faux). Cela permet de répondre proprement au client.
> 

### `src/lib/async-handler.js`

```jsx
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

```

> Une function (wrapper) qui capture les erreurs async et les passe au middleware d'erreurs.
> 

### `src/lib/validate.js` (Validation explicite)

```jsx
import { ValidationException } from "#lib/exceptions";

/**
 * Cette fonction vérifie que les données reçues respectent les règles prévues.
 * Si ce n'est pas le cas, elle lève une erreur (Exception) que le serveur catchera.
 */
export function validateData(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationException(result.error.flatten().fieldErrors);
  }

  return result.data;
}

```

> Nous n'utilisons plus de middleware caché. La validation est écrite directement dans le contrôleur pour que vous puissiez voir exactement quand et comment elle se produit.
> 

---

## 8. Middlewares

Les middlewares sont comme des portiers qui vérifient les requêtes avant qu'elles n'arrivent à destination.

### `src/middlewares/error-handler.js` (Le filet de sécurité)

C'est ici que toutes les erreurs du projet finissent. Ce code attrape les exceptions et renvoie un message JSON propre à l'utilisateur, évitant ainsi que le serveur ne plante.

### `src/middlewares/error-handler.js`

```jsx
import { HttpException } from "#lib/exceptions";
import { logger } from "#lib/logger";

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpException) {
    logger.warn({ err, path: req.path }, err.message);
  } else {
    logger.error({ err, path: req.path }, "Unhandled error");
  }

  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "Resource already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: "Resource not found",
    });
  }

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON",
    });
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    error: isProduction ? "Internal Server Error" : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
}

```

> Middleware global qui intercepte toutes les erreurs et renvoie une réponse formatée.
> 

### `src/middlewares/not-found.js`

```jsx
import { NotFoundException } from "#lib/exceptions";

export function notFoundHandler(req, res, next) {
  throw new NotFoundException(`Route ${req.method} ${req.path} not found`);
}

```

> Middleware pour les routes non trouvées.
> 

---

## 9. Schémas de validation

### `src/schemas/user.schema.js`

```jsx
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  name: z.string().min(2).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

```

> Zod permet de définir des schémas de validation type-safe avec des messages d'erreur personnalisés.
> 

---

---

## 10. Data Transfer Objects (DTO)

Le **DTO** agit comme un filtre de sécurité. Imaginez que votre base de données contient le mot de passe de l'utilisateur. Vous ne voulez jamais envoyer ce mot de passe par internet ! Le DTO permet de sélectionner uniquement les champs sûrs (id, email, name).

### `src/dto/user.dto.js`

```jsx
export class UserDto {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.createdAt;
  }

  // Cette méthode permet de transformer soit un utilisateur, soit une liste d'utilisateurs
  static transform(data) {
    if (Array.isArray(data)) {
      return data.map((user) => new UserDto(user));
    }
    return new UserDto(data);
  }
}

```

---

## 11. Services (La Logique Métier)

Le **Service** est l'ouvrier spécialisé. C'est lui qui parle à la base de données (via Prisma) et qui contient les règles de gestion (ex: on ne peut pas créer deux utilisateurs avec le même email).

### `src/services/user.service.js`

### `src/services/user.service.js`

```jsx
import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";

export class UserService {
  static async register(data) {
    const { email, password, name } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("Email déjà utilisé");
    }

    const hashedPassword = await hashPassword(password);

    return prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    return user;
  }

  static async findAll() {
    return prisma.user.findMany();
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }
}

```

> La couche Service contient la logique métier et les interactions avec la base de données.
> 

---

## 12. Contrôleurs

Le **Contrôleur** reçoit la requête SQL/HTTP. Son travail est simple :

1. **Valider** les données reçues (est-ce que l'email est correct ?).
2. **Appeler** le bon service pour faire le travail.
3. **Répondre** au client avec les données filtrées par le DTO.

### `src/controllers/user.controller.js`

```jsx
import { UserService } from "#services/user.service";
import { UserDto } from "#dto/user.dto";
import { signToken } from "#lib/jwt";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema } from "#schemas/user.schema";

export class UserController {
  static async register(req, res) {
    const validatedData = validateData(registerSchema, req.body);
    const user = await UserService.register(validatedData);
    const token = await signToken({ userId: user.id });

    res.status(201).json({
      success: true,
      user: UserDto.transform(user),
      token,
    });
  }

  static async login(req, res) {
    const validatedData = validateData(loginSchema, req.body);
    const { email, password } = validatedData;

    const user = await UserService.login(email, password);
    const token = await signToken({ userId: user.id });

    res.json({
      success: true,
      user: UserDto.transform(user),
      token,
    });
  }

  static async getAll(req, res) {
    const users = await UserService.findAll();
    res.json({
      success: true,
      users: UserDto.transform(users),
    });
  }

  static async getById(req, res) {
    const user = await UserService.findById(parseInt(req.params.id));
    res.json({
      success: true,
      user: UserDto.transform(user),
    });
  }
}

```

---

## 13. Routes (Les Adresses)

Le fichier de routes associe une adresse URL (ex: `/register`) à une méthode du contrôleur. C'est le plan de votre API.

### `src/routes/user.routes.js`

```jsx
import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";

const router = Router();

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register));
router.post("/login", asyncHandler(UserController.login));

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", asyncHandler(UserController.getById));

export default router;

```

---

## 14. Fichier principal

### `src/index.js`

```jsx
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import userRouter from "#routes/user.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// Utilisation des routes
app.use("/users", userRouter);
app.use("/", userRouter); // Pour garder /register et /login à la racine

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur <http://localhost>:${PORT}`);
});

```

---

## 15. Initialiser la base de données

```bash
npm run db:push

```

> Cette commande synchronise le schéma Prisma avec la base de données et génère le client.
> 

---

## 16. Lancer le projet

```bash
npm run dev

```

Explorer la base de données :

```bash
npm run db:studio

```

---

## 17. Tester l'API

```bash
# Route de test
curl <http://localhost:3000>

# Inscription
curl -X POST <http://localhost:3000/register> \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"email":"test@test.com","password":"password123","name":"John"}'

# Connexion
curl -X POST <http://localhost:3000/login> \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"email":"test@test.com","password":"password123"}'

# Liste des utilisateurs
curl <http://localhost:3000/users>

# Utilisateur par ID
curl <http://localhost:3000/users/1>

# Test erreur 404
curl <http://localhost:3000/unknown>

# Test validation
curl -X POST <http://localhost:3000/register> \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"email":"invalid","password":"short"}'

```

---