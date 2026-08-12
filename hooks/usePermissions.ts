"use client";

import { useEffect, useState } from "react";
import { getRoleById, type PermissionKey } from "@/services/roles";

interface StoredUser {
  full_name: string;
  is_super_admin: boolean;
  role_id: string | null;
}

interface ModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

const FULL_ACCESS: ModulePermissions = { view: true, add: true, edit: true, delete: true };
const NO_ACCESS: ModulePermissions = { view: false, add: false, edit: false, delete: false };

export function useModulePermissions(moduleKey: string) {
  const [permissions, setPermissions] = useState<ModulePermissions>(NO_ACCESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    let user: StoredUser;
    try {
      user = JSON.parse(stored);
    } catch {
      setLoading(false);
      return;
    }

    if (user.is_super_admin) {
      setPermissions(FULL_ACCESS);
      setLoading(false);
      return;
    }

    if (!user.role_id) {
      setPermissions(NO_ACCESS);
      setLoading(false);
      return;
    }

    getRoleById(user.role_id)
      .then((role) => {
        const modulePerms = role.permissions[moduleKey];
        setPermissions(modulePerms ?? NO_ACCESS);
      })
      .catch(() => setPermissions(NO_ACCESS))
      .finally(() => setLoading(false));
  }, [moduleKey]);

  return { permissions, loading };
}

export type { ModulePermissions, PermissionKey };