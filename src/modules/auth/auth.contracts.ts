export interface ISignUpData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IJwtData {
  sessionId: string;
  iss: string;
  iat: string;
  exp: string;
}
