// services\roles.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type PermissionKey = "view" | "add" | "edit" | "delete";
export type RolePermissions = Record<string, Record<PermissionKey, boolean>>;

export interface RoleData {
  id: string;
  name: string;
  permissions: RolePermissions;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface DeletedRoleData {
  id: string;
  name: string;
  permissions: RolePermissions;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CreateRolePayload {
  name: string;
  permissions: RolePermissions;
}

export interface UpdateRolePayload {
  name?: string;
  permissions?: RolePermissions;
}

export async function createRole(payload: CreateRolePayload): Promise<RoleData> {
  const response = await fetch(`${API_BASE_URL}/roles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to create role.");
  }

  return response.json();
}

export async function getRoles(): Promise<RoleData[]> {
  const response = await fetch(`${API_BASE_URL}/roles/`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch roles.");
  }

  return response.json();
}

export async function getRoleById(id: string): Promise<RoleData> {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch role.");
  }

  return response.json();
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<RoleData> {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to update role.");
  }

  return response.json();
}

export async function eraseRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/roles/${id}/erase`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to erase role.");
  }
}

export async function getDeletedRoles(): Promise<DeletedRoleData[]> {
  const response = await fetch(`${API_BASE_URL}/roles/deleted`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch deleted roles.");
  }

  return response.json();
}

export async function restoreRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/roles/${id}/restore`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to restore role.");
  }
}

export async function permanentDeleteRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/roles/${id}/permanent`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to permanently delete role.");
  }
}