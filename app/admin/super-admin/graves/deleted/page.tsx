"use client";

import { useEffect, useState } from "react";
import {
  getDeletedGraves,
  restoreGrave,
  permanentDeleteGrave,
  type DeletedGraveWithInformerData,
} from "@/services/graves";

export default function DeletedGravesPage() {
  const [graves, setGraves] = useState<DeletedGraveWithInformerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getDeletedGraves()
      .then(setGraves)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string, deceasedName: string) => {
    const confirmed = window.confirm(`Restore grave record for "${deceasedName}"?`);
    if (!confirmed) return;

    setRestoringId(id);
    setError(null);

    try {
      await restoreGrave(id);
      setGraves((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore grave.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id: string, deceasedName: string) => {
    const confirmed = window.confirm(
      `Permanently delete grave record for "${deceasedName}"? This cannot be undone. Any linked informer will be unlinked but kept.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      await permanentDeleteGrave(id);
      setGraves((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to permanently delete grave.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Deleted Graves</h1>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading deleted graves...</p>}

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
                <th className="px-4 py-3 text-left font-medium">Grave ID</th>
                <th className="px-4 py-3 text-left font-medium">Deceased Name</th>
                <th className="px-4 py-3 text-left font-medium">Father/Husband Name</th>
                <th className="px-4 py-3 text-left font-medium">Zone</th>
                <th className="px-4 py-3 text-left font-medium">ID Number</th>
                <th className="px-4 py-3 text-left font-medium">Informer Name</th>
                <th className="px-4 py-3 text-left font-medium">Informer Contact</th>
                <th className="px-4 py-3 text-left font-medium">Deleted At</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {graves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                    No deleted graves.
                  </td>
                </tr>
              ) : (
                graves.map((grave) => (
                  <tr key={grave.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{grave.grave_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      {grave.deceased_name} {grave.deceased_surname ?? ""}
                    </td>
                    <td className="px-4 py-3">{grave.father_or_husband_name ?? "—"}</td>
                    <td className="px-4 py-3">{grave.zone_id ?? "—"}</td>
                    <td className="px-4 py-3">{grave.identification_number ?? "—"}</td>
                    <td className="px-4 py-3">{grave.informer_full_name ?? "—"}</td>
                    <td className="px-4 py-3">{grave.informer_contact_number ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(grave.deleted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestore(grave.id, grave.deceased_name)}
                          disabled={restoringId === grave.id}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          {restoringId === grave.id ? "Restoring..." : "Restore"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(grave.id, grave.deceased_name)}
                          disabled={deletingId === grave.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === grave.id ? "Deleting..." : "Permanent Delete"}
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