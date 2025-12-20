import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";

export class UserService {
  static async register(data***REMOVED*** {
    const { email, password, name } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } }***REMOVED***;
    if (existingUser***REMOVED*** {
      throw new ConflictException("Email déjà utilisé"***REMOVED***;
    }

    const hashedPassword = await hashPassword(password***REMOVED***;

    return prisma.user.create({
      data: { email, password: hashedPassword, name },
    }***REMOVED***;
  }

  static async login(email, password***REMOVED*** {
    const user = await prisma.user.findUnique({ where: { email } }***REMOVED***;

    if (!user || !(await verifyPassword(user.password, password***REMOVED******REMOVED******REMOVED*** {
      throw new UnauthorizedException("Identifiants invalides"***REMOVED***;
    }

    return user;
  }

  static async findAll(***REMOVED*** {
    return prisma.user.findMany(***REMOVED***;
  }

  static async findById(id***REMOVED*** {
    const user = await prisma.user.findUnique({ where: { id } }***REMOVED***;

    if (!user***REMOVED*** {
      throw new NotFoundException("Utilisateur non trouvé"***REMOVED***;
    }

    return user;
  }
}
