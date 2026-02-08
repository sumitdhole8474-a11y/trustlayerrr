import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // Remove 'Bearer ' prefix if present
    const actualToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(actualToken, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}