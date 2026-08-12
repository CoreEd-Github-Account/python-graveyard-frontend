// services/auth.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
  role_id: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Login failed. Please try again.");
  }

  return response.json();
}