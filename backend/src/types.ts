export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
}

export interface AuthRequest extends Express.Request {
  user?: UserPayload;
}
