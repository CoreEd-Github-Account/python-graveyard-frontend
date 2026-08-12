"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoleById, updateRole, type PermissionKey, type RolePermissions } from "@/services/roles";

// Keep in sync with app/admin/super-admin/roles/add/page.tsx's MODULES list
const MODULES = [
  { key: "users", label: "Users" },
  { key: "graves", label: "Graves" },
];

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    getRoleById(id)
      .then((role) => {
        setRoleName(role.name);
        setPermissions(role.permissions);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load role."))
      .finally(() => setLoading(false));
  }, [id]);

  const togglePermission = (moduleKey: string, permission: PermissionKey) => {
    setPermissions((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [moduleKey]: {
          ...prev[moduleKey],
          [permission]: !prev[moduleKey][permission],
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);

    if (!roleName.trim()) {
      setNameError("Role name is required.");
      return;
    }

    if (!permissions) return;

    setSaving(true);

    try {
      await updateRole(id, { name: roleName.trim(), permissions });
      router.push(`/admin/super-admin/roles/details/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading role...</p>;
  }

  if (!permissions) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {error ?? "Role not found."}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Edit Role</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Role Name</label>
          <input
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              setNameError(null);
            }}
            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
              nameError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-black focus:ring-black/10"
            }`}
          />
          {nameError && <p className="text-xs text-red-600">{nameError}</p>}
        </div>

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
                          checked={permissions[module.key]?.[perm] ?? false}
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/super-admin/roles/view")}
            className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}