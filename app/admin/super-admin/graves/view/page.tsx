"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  searchGravesWithInformers,
  getGraveSearchSuggestions,
  eraseGrave,
  type GraveWithInformerData,
  type AdminGraveSearchField,
  type GraveSuggestionField,
} from "@/services/graves";
import { useModulePermissions } from "@/hooks/usePermissions";

const PAGE_SIZE = 20;
const SUGGESTION_MIN_CHARS = 2;
const SUGGESTION_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;

// Fields the type-ahead dropdown supports - kept separate from the full
// SEARCH_FIELDS list since only a couple of free-text fields warrant it.
const SUGGESTION_FIELDS: readonly AdminGraveSearchField[] = ["deceased_name", "deceased_surname"];

const SEARCH_FIELDS: { value: AdminGraveSearchField; label: string; type: "text" | "select" | "date_range" }[] = [
  { value: "deceased_name", label: "Deceased Name", type: "text" },
  { value: "deceased_surname", label: "Surname", type: "text" },
  { value: "father_or_husband_name", label: "Father/Husband Name", type: "text" },
  { value: "gender", label: "Gender", type: "select" },
  { value: "identification_number", label: "Identification Number", type: "text" },
  { value: "date_of_death", label: "Date of Death", type: "date_range" },
  { value: "date_buried", label: "Date Buried", type: "date_range" },
  { value: "grave_id", label: "Grave ID", type: "text" },
  { value: "zone_id", label: "Zone", type: "text" },
  { value: "informer_full_name", label: "Informer Full Name", type: "text" },
  { value: "informer_cnic", label: "Informer CNIC", type: "text" },
];

type AppliedSearch = { field: AdminGraveSearchField; term: string; termTo?: string };

function formatDateDDMMYY(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

export default function ViewGravesPage() {
  const router = useRouter();
  const { permissions, loading: permissionsLoading } = useModulePermissions("graves");

  const [graves, setGraves] = useState<GraveWithInformerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [erasingId, setErasingId] = useState<string | null>(null);

  const [searchField, setSearchField] = useState<AdminGraveSearchField | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermTo, setSearchTermTo] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<AppliedSearch | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    (targetPage: number, search: AppliedSearch | null) => {
      setLoading(true);
      setError(null);
      searchGravesWithInformers({
        searchField: search?.field,
        searchTerm: search?.term,
        searchTermTo: search?.termTo,
        page: targetPage,
        pageSize: PAGE_SIZE,
      })
        .then((res) => {
          setGraves(res.items);
          setTotal(res.total);
          setTotalPages(res.total_pages);
          setPage(res.page);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        })
        .finally(() => setLoading(false));
    },
    []
  );

  // Load page 1, unfiltered, as soon as the page mounts.
  useEffect(() => {
    fetchPage(1, null);
  }, [fetchPage]);

  // Close the suggestion dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up any pending debounce on unmount.
  useEffect(() => {
    return () => {
      if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
    };
  }, []);

  const fetchSuggestions = (field: GraveSuggestionField, term: string) => {
    getGraveSearchSuggestions({ searchField: field, searchTerm: term, limit: SUGGESTION_LIMIT })
      .then((results) => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      });
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);

    if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);

    const isSuggestable = SUGGESTION_FIELDS.includes(searchField as AdminGraveSearchField);
    if (!isSuggestable || value.trim().length < SUGGESTION_MIN_CHARS) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionDebounceRef.current = setTimeout(() => {
      fetchSuggestions(searchField as GraveSuggestionField, value.trim());
    }, SUGGESTION_DEBOUNCE_MS);
  };

  const handleSelectSuggestion = (value: string) => {
    setSearchTerm(value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleErase = async (id: string, deceasedName: string) => {
    const confirmed = window.confirm(
      `Erase grave record for "${deceasedName}"? It will be moved to Deleted Graves, where it can be restored or permanently deleted later.`
    );
    if (!confirmed) return;

    setErasingId(id);
    setError(null);

    try {
      await eraseGrave(id);
      // Re-fetch the current page rather than filtering locally, so the
      // totals/pagination stay accurate. If that was the last row on a
      // page beyond the first, step back a page instead of showing empty.
      const isLastRowOnPage = graves.length === 1 && page > 1;
      fetchPage(isLastRowOnPage ? page - 1 : page, appliedSearch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to erase grave.");
    } finally {
      setErasingId(null);
    }
  };

  const handleFieldSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AdminGraveSearchField | "";
    setSearchField(value);
    setSearchTerm("");
    setSearchTermTo("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!searchField) return;
    const fieldConfig = SEARCH_FIELDS.find((f) => f.value === searchField);
    setShowSuggestions(false);

    if (fieldConfig?.type === "date_range") {
      if (!searchTerm || !searchTermTo) return;
      const search: AppliedSearch = { field: searchField, term: searchTerm, termTo: searchTermTo };
      setAppliedSearch(search);
      fetchPage(1, search);
      return;
    }

    if (!searchTerm.trim()) return;
    const search: AppliedSearch = { field: searchField, term: searchTerm.trim() };
    setAppliedSearch(search);
    fetchPage(1, search);
  };

  const handleClear = () => {
    setSearchField("");
    setSearchTerm("");
    setSearchTermTo("");
    setAppliedSearch(null);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchPage(1, null);
  };

  const goToPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    fetchPage(targetPage, appliedSearch);
  };

  const activeFieldConfig = SEARCH_FIELDS.find((f) => f.value === searchField);

  return (
    <div>
      <h1 className="text-2xl font-semibold">View Graves</h1>

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
            ) : activeFieldConfig?.type === "date_range" ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  max={searchTermTo || undefined}
                  className="h-11 w-40 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-black"
                  aria-label={`${activeFieldConfig.label} from`}
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="date"
                  value={searchTermTo}
                  onChange={(e) => setSearchTermTo(e.target.value)}
                  min={searchTerm || undefined}
                  className="h-11 w-40 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-black"
                  aria-label={`${activeFieldConfig.label} to`}
                />
              </div>
            ) : (
              <div ref={searchBoxRef} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={`Search by ${activeFieldConfig?.label}...`}
                  autoComplete="off"
                  className="h-11 w-64 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="block w-full truncate px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

      {loading && <p className="mt-6 text-sm text-gray-500">Loading graves...</p>}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full whitespace-nowrap text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Grave ID</th>
                  <th className="px-4 py-3 text-left font-medium">Old Grave ID</th>
                  <th className="px-4 py-3 text-left font-medium">Deceased Name</th>
                  <th className="px-4 py-3 text-left font-medium">Surname</th>
                  <th className="px-4 py-3 text-left font-medium">Zone</th>
                  <th className="px-4 py-3 text-left font-medium">Deceased Date of Death</th>
                  <th className="px-4 py-3 text-left font-medium">Date Buried</th>
                  <th className="px-4 py-3 text-left font-medium">Deceased Gender</th>
                  <th className="px-4 py-3 text-left font-medium">Deceased Native Place</th>
                  <th className="px-4 py-3 text-left font-medium">Record Created At</th>
                  <th className="px-4 py-3 text-left font-medium">Informer Name</th>
                  <th className="px-4 py-3 text-left font-medium">Informer Relationship</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {graves.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-6 text-center text-gray-500">
                      {appliedSearch ? "No matching graves found." : "No graves found."}
                    </td>
                  </tr>
                ) : (
                  graves.map((grave) => (
                    <tr key={grave.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{grave.grave_id ?? "—"}</td>
                      <td className="px-4 py-3">{grave.old_grave_id ?? "—"}</td>
                      <td className="px-4 py-3">{grave.deceased_name}</td>
                      <td className="px-4 py-3">{grave.deceased_surname ?? "—"}</td>
                      <td className="px-4 py-3">{grave.zone_id ?? "—"}</td>
                      <td className="px-4 py-3">{formatDateDDMMYY(grave.date_of_death)}</td>
                      <td className="px-4 py-3">{formatDateDDMMYY(grave.date_buried)}</td>
                      <td className="px-4 py-3">{grave.gender ?? "—"}</td>
                      <td className="px-4 py-3">{grave.native_place ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDateDDMMYY(grave.created_at)},{" "}
                        {new Date(grave.created_at).toLocaleTimeString(undefined, {
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">{grave.informer_full_name ?? "—"}</td>
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

          {total > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {total} record{total !== 1 ? "s" : ""} found — page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}