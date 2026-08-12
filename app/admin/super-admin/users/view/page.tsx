// app\admin\super-admin\users\view\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, eraseUser, type UserData } from "@/services/users";
import { useModulePermissions } from "@/hooks/usePermissions";

export default function ViewUsersPage() {
  const router = useRouter();
  const { permissions, loading: permissionsLoading } = useModulePermissions("users");

  // Users
  const [users, setUsers] = useState<UserData[]>([]);

  // Loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Erase
  const [erasingId, setErasingId] = useState<string | null>(null);

  // Search
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get users
  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Erase user
  const handleErase = async (id: string, fullName: string) => {
    const confirmed = window.confirm(
      `Erase user "${fullName}"? They will be moved to Deleted Users, where they can be restored or permanently deleted later.`
    );

    if (!confirmed) return;

    setErasingId(id);
    setError(null);

    try {
      await eraseUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to erase user.");
    } finally {
      setErasingId(null);
    }
  };

  // Search users
  const displayedUsers = users.filter((user) => {
    if (!searchField || !searchTerm) {
      return true;
    }

    const value = user[searchField as keyof UserData];

    return String(value ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const showActionsColumn = !permissionsLoading && (permissions.edit || permissions.delete);

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-2xl font-semibold">View Users</h1>

      {/* Search */}
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Dropdown */}
        <select
          value={searchField}
          onChange={(e) => {
            setSearchField(e.target.value);
            setSearchTerm("");
          }}
          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-black"
        >
          <option value="">Search by...</option>
          <option value="full_name">Full Name</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>

        {/* Search Input */}
        {searchField && (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
          />
        )}
      </div>

      {/* Loading */}
      {loading && <p className="mt-6 text-sm text-gray-500">Loading users...</p>}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Full Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created At</th>
                {showActionsColumn && (
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={showActionsColumn ? 7 : 6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    {/* Full Name */}
                    <td className="px-4 py-3">{user.full_name}</td>

                    {/* Email */}
                    <td className="px-4 py-3">{user.email}</td>

                    {/* Phone */}
                    <td className="px-4 py-3">{user.phone ?? "—"}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {user.is_super_admin ? "Super Admin" : "Staff"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.is_active
                            ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                            : "rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    {showActionsColumn && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {permissions.edit && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/super-admin/users/edit/${user.id}`)
                              }
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                          )}

                          {permissions.delete && (
                            <button
                              type="button"
                              onClick={() => handleErase(user.id, user.full_name)}
                              disabled={erasingId === user.id}
                              className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                            >
                              {erasingId === user.id ? "Erasing..." : "Erase"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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