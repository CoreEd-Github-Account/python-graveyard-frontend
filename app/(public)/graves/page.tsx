// // app\(public)\graves\page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { getGraves, type GraveData } from "@/services/graves";
// import Link from "next/link";

// type SearchField =
//   | "deceased_name"
//   | "deceased_surname"
//   | "father_or_husband_name"
//   | "gender"
//   | "date_of_death";

// const SEARCH_FIELDS: { value: SearchField; label: string; type: "text" | "select" | "date" }[] = [
//   { value: "deceased_name", label: "Deceased Name", type: "text" },
//   { value: "father_or_husband_name", label: "Father/Husband Name", type: "text" },
//   { value: "gender", label: "Gender", type: "select" },
//   { value: "date_of_death", label: "Date of Death", type: "date" },
//   { value: "deceased_surname", label: "Surname", type: "text" },
// ];

// function getFieldValue(grave: GraveData, field: SearchField): string {
//   const value = grave[field];
//   return String(value ?? "");
// }

// export default function GraveListPage() {
//   const [graves, setGraves] = useState<GraveData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [searchField, setSearchField] = useState<SearchField | "">("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [appliedSearch, setAppliedSearch] = useState<{ field: SearchField; term: string } | null>(
//     null
//   );

//   useEffect(() => {
//     getGraves()
//       .then(setGraves)
//       .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
//       .finally(() => setLoading(false));
//   }, []);

//   // Only graves an admin has actually assigned a plot to — pending public
//   // reservations still awaiting staff review are excluded. grave_id itself
//   // isn't shown as a column, but still used here to decide what's published.
//   const assignedGraves = useMemo(() => graves.filter((g) => g.grave_id !== null), [graves]);

//   const handleFieldSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value as SearchField | "";
//     setSearchField(value);
//     setSearchTerm("");
//     setAppliedSearch(null);
//   };

//   const handleSearch = () => {
//     if (!searchField || !searchTerm.trim()) return;
//     setAppliedSearch({ field: searchField, term: searchTerm.trim().toLowerCase() });
//   };

//   const handleClear = () => {
//     setSearchField("");
//     setSearchTerm("");
//     setAppliedSearch(null);
//   };

//   const activeFieldConfig = SEARCH_FIELDS.find((f) => f.value === searchField);

//   const displayedGraves = appliedSearch
//     ? assignedGraves.filter((grave) =>
//         getFieldValue(grave, appliedSearch.field).toLowerCase().includes(appliedSearch.term)
//       )
//     : assignedGraves;

//   return (
//     <main className="mx-auto w-full max-w-[1360px] px-6 py-12 sm:px-10">
//       <h1 className="font-serif text-6xl text-gray-900 mb-8">Grave List</h1>

//       {/* Search */}
//       <div className="mb-6 flex flex-wrap items-center gap-3">
//         <select
//           value={searchField}
//           onChange={handleFieldSelect}
//           className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
//         >
//           <option value="">Search by...</option>
//           {SEARCH_FIELDS.map((field) => (
//             <option key={field.value} value={field.value}>
//               {field.label}
//             </option>
//           ))}
//         </select>

//         {searchField && (
//           <>
//             {activeFieldConfig?.type === "select" ? (
//               <select
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
//               >
//                 <option value="">Select gender...</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="others">Others</option>
//               </select>
//             ) : activeFieldConfig?.type === "date" ? (
//               <input
//                 type="date"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-black"
//               />
//             ) : (
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 placeholder={`Search by ${activeFieldConfig?.label}...`}
//                 className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
//               />
//             )}

//             <button
//               type="button"
//               onClick={handleSearch}
//               className="h-12 rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:opacity-90"
//             >
//               Search
//             </button>
//             <button
//               type="button"
//               onClick={handleClear}
//               className="h-12 rounded-lg border border-gray-200 px-6 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
//             >
//               Clear
//             </button>
//           </>
//         )}
//       </div>

//       {loading && <p className="text-sm text-gray-500">Loading grave records...</p>}

//       {error && (
//         <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       {!loading && !error && (
//         <div className="overflow-x-auto rounded-2xl border border-gray-200">
//           <table className="min-w-full whitespace-nowrap text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left font-medium text-gray-900">Deceased Name</th>
//                 <th className="px-4 py-3 text-left font-medium text-gray-900">Surname</th>
//                 <th className="px-4 py-3 text-left font-medium text-gray-900">Father/Husband Name</th>
//                 <th className="px-4 py-3 text-left font-medium text-gray-900">Gender</th>
//                 <th className="px-4 py-3 text-left font-medium text-gray-900">Date of Death</th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedGraves.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
//                     {appliedSearch ? "No matching records found." : "No grave records available yet."}
//                   </td>
//                 </tr>
//               ) : (
//                 displayedGraves.map((grave) => (
//                   <tr key={grave.id} className="border-t border-gray-100">
//                     <td className="px-4 py-3 font-medium text-gray-900">
//                       <Link href={`/graves/${grave.id}`} className="text-gray-900 underline-offset-2 hover:underline">
//                         {grave.deceased_name}
//                       </Link>
//                     </td>
//                     <td className="px-4 py-3">{grave.deceased_surname ?? "—"}</td>
//                     <td className="px-4 py-3">{grave.father_or_husband_name ?? "—"}</td>
//                     <td className="px-4 py-3">{grave.gender ?? "—"}</td>
//                     <td className="px-4 py-3">{grave.date_of_death ?? "—"}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </main>
//   );
// }





















"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  searchGraves,
  getPublicGraveSuggestions,
  type GraveData,
  type GraveSearchField,
} from "@/services/graves";

const PAGE_SIZE = 20;
const SUGGESTION_MIN_CHARS = 2;
const SUGGESTION_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;

// Fields the type-ahead dropdown supports - a small subset of SEARCH_FIELDS,
// kept in sync with PUBLIC_SUGGESTION_FIELDS in app/controllers/grave_controller.py.
const SUGGESTION_FIELDS: readonly GraveSearchField[] = ["deceased_name", "deceased_surname"];

const SEARCH_FIELDS: { value: GraveSearchField; label: string; type: "text" | "select" | "date" }[] = [
  { value: "deceased_name", label: "Deceased Name", type: "text" },
  { value: "father_or_husband_name", label: "Father/Husband Name", type: "text" },
  { value: "gender", label: "Gender", type: "select" },
  { value: "date_of_death", label: "Date of Death", type: "date" },
  { value: "deceased_surname", label: "Surname", type: "text" },
];

export default function GraveListPage() {
  const [graves, setGraves] = useState<GraveData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchField, setSearchField] = useState<GraveSearchField | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<{ field: GraveSearchField; term: string } | null>(
    null
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const activeFieldConfig = SEARCH_FIELDS.find((f) => f.value === searchField);

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

  const fetchSuggestions = (field: "deceased_name" | "deceased_surname", term: string) => {
    getPublicGraveSuggestions({ searchField: field, searchTerm: term, limit: SUGGESTION_LIMIT })
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

    const isSuggestable = SUGGESTION_FIELDS.includes(searchField as GraveSearchField);
    if (!isSuggestable || value.trim().length < SUGGESTION_MIN_CHARS) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionDebounceRef.current = setTimeout(() => {
      fetchSuggestions(searchField as "deceased_name" | "deceased_surname", value.trim());
    }, SUGGESTION_DEBOUNCE_MS);
  };

  const handleSelectSuggestion = (value: string) => {
    setSearchTerm(value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const runSearch = (field: GraveSearchField, term: string, targetPage: number) => {
    setLoading(true);
    setError(null);
    searchGraves({ searchField: field, searchTerm: term, page: targetPage, pageSize: PAGE_SIZE })
      .then((res) => {
        setGraves(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
        setPage(res.page);
        setHasSearched(true);
        setAppliedSearch({ field, term });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  };

  const handleFieldSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as GraveSearchField | "";
    setSearchField(value);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!searchField || !searchTerm.trim()) return;
    setShowSuggestions(false);
    runSearch(searchField, searchTerm.trim(), 1);
  };

  const handleClear = () => {
    setSearchField("");
    setSearchTerm("");
    setAppliedSearch(null);
    setGraves([]);
    setHasSearched(false);
    setError(null);
    setPage(1);
    setTotalPages(0);
    setTotal(0);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const goToPage = (targetPage: number) => {
    if (!appliedSearch || targetPage < 1 || targetPage > totalPages) return;
    runSearch(appliedSearch.field, appliedSearch.term, targetPage);
  };

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
              <div ref={searchBoxRef} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={`Search by ${activeFieldConfig?.label}...`}
                  autoComplete="off"
                  className="h-12 w-64 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="block w-full truncate px-4 py-2 text-left text-[15px] text-gray-700 hover:bg-gray-100"
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

      {!hasSearched && !loading && !error && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Choose a field above and search to view grave records.
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Searching grave records...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && (
        <>
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
                {graves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  graves.map((grave) => (
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
    </main>
  );
}