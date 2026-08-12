// services/users.ts
"use server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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


export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role_id?: string | null;
  is_super_admin?: boolean;
  is_active?: boolean;
}


export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role_id?: string | null;
  is_super_admin?: boolean;
}


export async function getUsers(): Promise<UserData[]> {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch users.");
  }

  return response.json();
}


export async function getUserById(id: string): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch user.");
  }

  return response.json();
}


export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to update user.");
  }

  return response.json();
}


export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to delete user.");
  }
}


export async function createUser(payload: CreateUserPayload): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to create user.");
  }

  return response.json();
}


export interface DeletedUserData extends UserData {
  deleted_at: string;
}

export async function eraseUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/erase`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to erase user.");
  }
}

export async function getDeletedUsers(): Promise<DeletedUserData[]> {
  const response = await fetch(`${API_BASE_URL}/users/deleted`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch deleted users.");
  }

  return response.json();
}

export async function restoreUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/restore`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to restore user.");
  }
}

export async function permanentDeleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/permanent`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to permanently delete user.");
  }
}