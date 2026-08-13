"use client";

import { useEffect, useMemo, useState } from "react";
import { getGraves, type GraveData } from "@/services/graves";
import Link from "next/link";

type SearchField =
  | "deceased_name"
  | "deceased_surname"
  | "father_or_husband_name"
  | "gender"
  | "date_of_death";

const SEARCH_FIELDS: { value: SearchField; label: string; type: "text" | "select" | "date" }[] = [
  { value: "deceased_name", label: "Deceased Name", type: "text" },
  { value: "father_or_husband_name", label: "Father/Husband Name", type: "text" },
  { value: "gender", label: "Gender", type: "select" },
  { value: "date_of_death", label: "Date of Death", type: "date" },
  { value: "deceased_surname", label: "Surname", type: "text" },
];

function getFieldValue(grave: GraveData, field: SearchField): string {
  const value = grave[field];
  return String(value ?? "");
}

export default function GraveListPage() {
  const [graves, setGraves] = useState<GraveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchField, setSearchField] = useState<SearchField | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<{ field: SearchField; term: string } | null>(
    null
  );

  useEffect(() => {
    getGraves()
      .then(setGraves)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  // Only graves an admin has actually assigned a plot to — pending public
  // reservations still awaiting staff review are excluded. grave_id itself
  // isn't shown as a column, but still used here to decide what's published.
  const assignedGraves = useMemo(() => graves.filter((g) => g.grave_id !== null), [graves]);

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

  const displayedGraves = appliedSearch
    ? assignedGraves.filter((grave) =>
        getFieldValue(grave, appliedSearch.field).toLowerCase().includes(appliedSearch.term)
      )
    : assignedGraves;

  return (
    <main className="mx-auto w-full max-w-[1360px] px-6 py-12 sm:px-10">
      <h1 className="font-serif text-6xl text-gray-900 mb-8">Grave List</h1>

      {/* Search */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={searchField}
          onChange={handleFieldSelect}
          className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
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
                className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
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
                className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
              />
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={`Search by ${activeFieldConfig?.label}...`}
                className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
              />
            )}

            <button
              type="button"
              onClick={handleSearch}
              className="h-12 rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:opacity-90"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-lg border border-gray-200 px-6 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading grave records...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full whitespace-nowrap text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Deceased Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Surname</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Father/Husband Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Gender</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Date of Death</th>
              </tr>
            </thead>
            <tbody>
              {displayedGraves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    {appliedSearch ? "No matching records found." : "No grave records available yet."}
                  </td>
                </tr>
              ) : (
                displayedGraves.map((grave) => (
                  <tr key={grave.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/graves/${grave.id}`} className="text-gray-900 underline-offset-2 hover:underline">
                        {grave.deceased_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{grave.deceased_surname ?? "—"}</td>
                    <td className="px-4 py-3">{grave.father_or_husband_name ?? "—"}</td>
                    <td className="px-4 py-3">{grave.gender ?? "—"}</td>
                    <td className="px-4 py-3">{grave.date_of_death ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}