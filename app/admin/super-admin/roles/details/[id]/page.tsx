"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoleById, type RoleData } from "@/services/roles";

const MODULE_LABELS: Record<string, string> = {
  users: "Users",
  graves: "Graves",
};

const PERMISSION_KEYS = ["view", "add", "edit", "delete"] as const;

export default function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [role, setRole] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRoleById(id)
      .then(setRole)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load role."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading role...</p>;
  }

  if (error || !role) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {error ?? "Role not found."}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Role Details</h1>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Role Name</label>
          <div className="flex h-11 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900">
            {role.name}
          </div>
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
                {Object.entries(role.permissions).map(([moduleKey, perms]) => (
                  <tr key={moduleKey} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {MODULE_LABELS[moduleKey] ?? moduleKey}
                    </td>
                    {PERMISSION_KEYS.map((perm) => (
                      <td key={perm} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[perm]}
                          disabled
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

        <div className="space-y-1 text-sm text-gray-500">
          <p>Created: {new Date(role.created_at).toLocaleString()}</p>
          <p>Last Updated: {new Date(role.updated_at).toLocaleString()}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/super-admin/roles/edit/${role.id}`)}
            className="h-11 flex-1 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-black/90"
          >
            Edit Role
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/super-admin/roles/view")}
            className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}