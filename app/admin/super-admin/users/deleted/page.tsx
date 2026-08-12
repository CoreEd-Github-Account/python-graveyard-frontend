// app\admin\super-admin\users\deleted\page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getDeletedUsers,
  restoreUser,
  permanentDeleteUser,
  type DeletedUserData,
} from "@/services/users";

export default function DeletedUsersPage() {
  const [users, setUsers] = useState<DeletedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getDeletedUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string, fullName: string) => {
    const confirmed = window.confirm(`Restore user "${fullName}"?`);
    if (!confirmed) return;

    setRestoringId(id);
    setError(null);

    try {
      await restoreUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore user.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id: string, fullName: string) => {
    const confirmed = window.confirm(
      `Permanently delete user "${fullName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      await permanentDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to permanently delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Deleted Users</h1>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading deleted users...</p>}

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
                <th className="px-4 py-3 text-left font-medium">Full Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Deleted At</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No deleted users.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{user.full_name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3">{user.is_super_admin ? "Super Admin" : "Staff"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.deleted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestore(user.id, user.full_name)}
                          disabled={restoringId === user.id}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          {restoringId === user.id ? "Restoring..." : "Restore"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(user.id, user.full_name)}
                          disabled={deletingId === user.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === user.id ? "Deleting..." : "Permanent Delete"}
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