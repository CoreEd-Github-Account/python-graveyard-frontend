"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoles, eraseRole, type RoleData } from "@/services/roles";

export default function ViewRolesPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [erasingId, setErasingId] = useState<string | null>(null);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  const displayedRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleErase = async (role: RoleData) => {
    const userCount = role.user_count ?? 0;
    const message =
      userCount > 0
        ? `Erase role "${role.name}"? ${userCount} user(s) are currently assigned this role — their role will be removed. They'll need to be manually reassigned, even if you restore this role later. Continue?`
        : `Erase role "${role.name}"? It will be moved to Deleted Roles, where it can be restored or permanently deleted later.`;

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setErasingId(role.id);
    setError(null);

    try {
      await eraseRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to erase role.");
    } finally {
      setErasingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">View Roles</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by role name..."
          className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
        />
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading roles...</p>}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Role Name</th>
                <th className="px-4 py-3 text-left font-medium">Users</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRoles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No roles found.
                  </td>
                </tr>
              ) : (
                displayedRoles.map((role) => (
                  <tr key={role.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                    <td className="px-4 py-3">
                      {(role.user_count ?? 0) > 0 ? (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          {role.user_count} user{role.user_count === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">0 users</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/super-admin/roles/edit/${role.id}`)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleErase(role)}
                          disabled={erasingId === role.id}
                          className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {erasingId === role.id ? "Erasing..." : "Erase"}
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