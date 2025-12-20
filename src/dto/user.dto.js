export class UserDto {
  constructor(user***REMOVED*** {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.createdAt;
  }

  // Cette méthode permet de transformer soit un utilisateur, soit une liste d'utilisateurs
  static transform(data***REMOVED*** {
    if (Array.isArray(data***REMOVED******REMOVED*** {
      return data.map((user***REMOVED*** => new UserDto(user***REMOVED******REMOVED***;
    }
    return new UserDto(data***REMOVED***;
  }
}
