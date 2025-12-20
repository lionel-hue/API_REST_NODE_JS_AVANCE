import { UserService } from "#services/user.service";
import { UserDto } from "#dto/user.dto";
import { signToken } from "#lib/jwt";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema } from "#schemas/user.schema";

export class UserController {
  static async register(req, res***REMOVED*** {
    const validatedData = validateData(registerSchema, req.body***REMOVED***;
    const user = await UserService.register(validatedData***REMOVED***;
    const token = await signToken({ userId: user.id }***REMOVED***;

    res.status(201***REMOVED***.json({
      success: true,
      user: UserDto.transform(user***REMOVED***,
      token,
    }***REMOVED***;
  }

  static async login(req, res***REMOVED*** {
    const validatedData = validateData(loginSchema, req.body***REMOVED***;
    const { email, password } = validatedData;

    const user = await UserService.login(email, password***REMOVED***;
    const token = await signToken({ userId: user.id }***REMOVED***;

    res.json({
      success: true,
      user: UserDto.transform(user***REMOVED***,
      token,
    }***REMOVED***;
  }

  static async getAll(req, res***REMOVED*** {
    const users = await UserService.findAll(***REMOVED***;
    res.json({
      success: true,
      users: UserDto.transform(users***REMOVED***,
    }***REMOVED***;
  }

  static async getById(req, res***REMOVED*** {
    const user = await UserService.findById(parseInt(req.params.id***REMOVED******REMOVED***;
    res.json({
      success: true,
      user: UserDto.transform(user***REMOVED***,
    }***REMOVED***;
  }
}
