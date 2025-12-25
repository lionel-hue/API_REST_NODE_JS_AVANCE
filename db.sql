Table User {
  id String [pk]
  email String [unique]
  password String
  firstName String
  lastName String
  emailVerifiedAt DateTime
  twoFactorSecret String
  twoFactorEnabledAt DateTime
  disabledAt DateTime
  createdAt DateTime [default: `now(***REMOVED***`]
  updatedAt DateTime
}

Table OAuthAccount {
  id String [pk]
  provider String
  providerId String
  userId String [ref: > User.id]
  createdAt DateTime [default: `now(***REMOVED***`]

  indexes {
    (provider, providerId***REMOVED*** [unique]
  }
}

Table RefreshToken {
  id String [pk]
  token String [unique]
  userId String [ref: > User.id]
  userAgent String
  ipAddress String
  expiresAt DateTime
  revokedAt DateTime
  createdAt DateTime [default: `now(***REMOVED***`]
}

Table BlacklistedAccessToken {
  id String [pk]
  token String [unique]
  userId String [ref: > User.id]
  expiresAt DateTime
  createdAt DateTime [default: `now(***REMOVED***`]
}

Table VerificationToken {
  id String [pk]
  token String [unique]
  userId String [ref: > User.id]
  expiresAt DateTime
  createdAt DateTime [default: `now(***REMOVED***`]
}

Table PasswordResetToken {
  id String [pk]
  token String [unique]
  userId String [ref: > User.id]
  expiresAt DateTime
  createdAt DateTime [default: `now(***REMOVED***`]
}

Table LoginHistory {
  id String [pk]
  userId String [ref: > User.id]
  ipAddress String
  userAgent String
  success Boolean
  createdAt DateTime [default: `now(***REMOVED***`]
}
