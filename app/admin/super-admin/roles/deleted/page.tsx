"use client";

import { useEffect, useState } from "react";
import {
  getDeletedRoles,
  restoreRole,
  permanentDeleteRole,
  type DeletedRoleData,
} from "@/services/roles";

export default function DeletedRolesPage() {
  const [roles, setRoles] = useState<DeletedRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getDeletedRoles()
      .then(setRoles)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Restore role "${name}"? Note: any users who had this role before it was erased will need to be manually reassigned — that link isn't restored automatically.`
    );
    if (!confirmed) return;

    setRestoringId(id);
    setError(null);

    try {
      await restoreRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore role.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Permanently delete role "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      await permanentDeleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to permanently delete role.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Deleted Roles</h1>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading deleted roles...</p>}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full whitespace-nowrap text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Role Name</th>
                <th className="px-4 py-3 text-left font-medium">Deleted At</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No deleted roles.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{role.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(role.deleted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestore(role.id, role.name)}
                          disabled={restoringId === role.id}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          {restoringId === role.id ? "Restoring..." : "Restore"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(role.id, role.name)}
                          disabled={deletingId === role.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === role.id ? "Deleting..." : "Permanent Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}