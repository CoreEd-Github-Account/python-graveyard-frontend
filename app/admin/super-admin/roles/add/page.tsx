// app\admin\super-admin\roles\add\page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRole, type PermissionKey, type RolePermissions } from "@/services/roles";

// Modules list — add more entries here later (e.g. Deleted Users, Deleted Graves, Roles)
// and the table below will automatically pick them up, no other changes needed.
const MODULES = [
  { key: "users", label: "Users" },
  { key: "graves", label: "Graves" },
];

const buildInitialPermissions = (): RolePermissions =>
  MODULES.reduce((acc, module) => {
    acc[module.key] = { view: false, add: false, edit: false, delete: false };
    return acc;
  }, {} as RolePermissions);

export default function AddRolePage() {
  const router = useRouter();

  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<RolePermissions>(buildInitialPermissions());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const togglePermission = (moduleKey: string, permission: PermissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permission]: !prev[moduleKey][permission],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);

    if (!roleName.trim()) {
      setNameError("Role name is required.");
      return;
    }

    setSaving(true);

    try {
      await createRole({ name: roleName.trim(), permissions });
      router.push("/admin/super-admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Add Role</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Role Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Role Name</label>
          <input
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              setNameError(null);
            }}
            placeholder="e.g., Inventory Manager"
            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
              nameError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-black focus:ring-black/10"
            }`}
          />
          {nameError && <p className="text-xs text-red-600">{nameError}</p>}
        </div>

        {/* Permissions matrix */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Permissions</label>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Module</th>
                  <th className="px-4 py-3 text-center font-medium">View</th>
                  <th className="px-4 py-3 text-center font-medium">Add</th>
                  <th className="px-4 py-3 text-center font-medium">Edit</th>
                  <th className="px-4 py-3 text-center font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((module) => (
                  <tr key={module.key} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{module.label}</td>
                    {(["view", "add", "edit", "delete"] as PermissionKey[]).map((perm) => (
                      <td key={perm} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[module.key][perm]}
                          onChange={() => togglePermission(module.key, perm)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-11 flex-1 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Role"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/super-admin/dashboard")}
            className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}