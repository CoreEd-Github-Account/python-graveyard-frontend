"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGravesWithInformers, eraseGrave, type GraveWithInformerData } from "@/services/graves";
import { useModulePermissions } from "@/hooks/usePermissions";

const PUBLIC_SOURCE_LABEL = "Public Website Reservation";

type SearchField =
  | "deceased_name"
  | "father_or_husband_name"
  | "gender"
  | "identification_number"
  | "date_of_death"
  | "informer_full_name"
  | "informer_cnic";

const SEARCH_FIELDS: { value: SearchField; label: string; type: "text" | "select" | "date" }[] = [
  { value: "deceased_name", label: "Deceased Name", type: "text" },
  { value: "father_or_husband_name", label: "Father/Husband Name", type: "text" },
  { value: "gender", label: "Gender", type: "select" },
  { value: "identification_number", label: "Identification Number", type: "text" },
  { value: "date_of_death", label: "Date of Death", type: "date" },
  { value: "informer_full_name", label: "Informer Full Name", type: "text" },
  { value: "informer_cnic", label: "Informer CNIC", type: "text" },
];

function getFieldValue(grave: GraveWithInformerData, field: SearchField): string {
  if (field === "deceased_name") {
    return `${grave.deceased_name} ${grave.deceased_surname ?? ""}`.trim();
  }
  const value = grave[field as keyof GraveWithInformerData];
  return String(value ?? "");
}

export default function PublicReservationDataPage() {
  const router = useRouter();
  const { permissions } = useModulePermissions("graves");

  const [graves, setGraves] = useState<GraveWithInformerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [erasingId, setErasingId] = useState<string | null>(null);

  const [searchField, setSearchField] = useState<SearchField | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<{ field: SearchField; term: string } | null>(
    null
  );

  useEffect(() => {
    getGravesWithInformers()
      .then(setGraves)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleErase = async (id: string, deceasedName: string) => {
    const confirmed = window.confirm(
      `Erase grave record for "${deceasedName}"? It will be moved to Deleted Graves, where it can be restored or permanently deleted later.`
    );
    if (!confirmed) return;

    setErasingId(id);
    setError(null);

    try {
      await eraseGrave(id);
      setGraves((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to erase grave.");
    } finally {
      setErasingId(null);
    }
  };

  const handleFieldSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SearchField | "";
    setSearchField(value);
    setSearchTerm("");
    setAppliedSearch(null);
  };

  const handleSearch = () => {
    if (!searchField || !searchTerm.trim()) return;
    setAppliedSearch({ field: searchField, term: searchTerm.trim().toLowerCase() });
  };

  const handleClear = () => {
    setSearchField("");
    setSearchTerm("");
    setAppliedSearch(null);
  };

  const activeFieldConfig = SEARCH_FIELDS.find((f) => f.value === searchField);

  const publicGraves = graves.filter((g) => g.form_received_by === PUBLIC_SOURCE_LABEL);

  const displayedGraves = appliedSearch
    ? publicGraves.filter((grave) =>
        getFieldValue(grave, appliedSearch.field).toLowerCase().includes(appliedSearch.term)
      )
    : publicGraves;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Public Reservation Data</h1>
      <p className="mt-1 text-sm text-gray-500">
        Grave records submitted through the public website's Reservation form, awaiting staff
        review and plot assignment.
      </p>

      {/* Search */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={searchField}
          onChange={handleFieldSelect}
          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-black"
        >
          <option value="">Search by...</option>
          {SEARCH_FIELDS.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>

        {searchField && (
          <>
            {activeFieldConfig?.type === "select" ? (
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
              >
                <option value="">Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            ) : activeFieldConfig?.type === "date" ? (
              <input
                type="date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
              />
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={`Search by ${activeFieldConfig?.label}...`}
                className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
              />
            )}

            <button
              type="button"
              onClick={handleSearch}
              className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/90"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading public reservations...</p>}

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
                <th className="px-4 py-3 text-left font-medium">Deceased Name</th>
                <th className="px-4 py-3 text-left font-medium">Date of Death</th>
                <th className="px-4 py-3 text-left font-medium">Gender</th>
                <th className="px-4 py-3 text-left font-medium">Native Place</th>
                <th className="px-4 py-3 text-left font-medium">Submitted At</th>
                <th className="px-4 py-3 text-left font-medium">Informer Name</th>
                <th className="px-4 py-3 text-left font-medium">Informer Contact</th>
                <th className="px-4 py-3 text-left font-medium">Relationship</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayedGraves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                    {appliedSearch
                      ? "No matching public reservations found."
                      : "No public reservations yet."}
                  </td>
                </tr>
              ) : (
                displayedGraves.map((grave) => (
                  <tr key={grave.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      {grave.deceased_name} {grave.deceased_surname ?? ""}
                    </td>
                    <td className="px-4 py-3">{grave.date_of_death ?? "—"}</td>
                    <td className="px-4 py-3">{grave.gender ?? "—"}</td>
                    <td className="px-4 py-3">{grave.native_place ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(grave.created_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">{grave.informer_full_name ?? "—"}</td>
                    <td className="px-4 py-3">{grave.informer_contact_number ?? "—"}</td>
                    <td className="px-4 py-3">{grave.relationship_with_deceased ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/super-admin/graves/details/${grave.id}`)
                          }
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          View
                        </button>

                        {permissions.edit && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/admin/super-admin/graves/edit/${grave.id}`)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        )}

                        {permissions.delete && (
                          <button
                            type="button"
                            onClick={() => handleErase(grave.id, grave.deceased_name)}
                            disabled={erasingId === grave.id}
                            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                          >
                            {erasingId === grave.id ? "Erasing..." : "Erase"}
                          </button>
                        )}
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