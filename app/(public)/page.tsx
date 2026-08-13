"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getGraves } from "@/services/graves";

export default function HomePage() {
  const router = useRouter();

  const [graveNumber, setGraveNumber] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [name, setName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!graveNumber && !zoneName && !name && !dateFrom && !dateTo) {
      setError("Enter at least one search field.");
      return;
    }

    setLoading(true);

    try {
      const allGraves = await getGraves();

      // Only records an admin has actually assigned a plot to are
      // searchable — same rule the Grave List page enforces.
      const assigned = allGraves.filter((g) => g.grave_id !== null);

      const matches = assigned.filter((g) => {
        if (graveNumber && String(g.grave_id ?? "") !== graveNumber.trim()) return false;
        if (zoneName && !(g.zone_id ?? "").toLowerCase().includes(zoneName.trim().toLowerCase()))
          return false;
        if (name) {
          const fullName = `${g.deceased_name} ${g.deceased_surname ?? ""}`.toLowerCase();
          if (!fullName.includes(name.trim().toLowerCase())) return false;
        }
        if (dateFrom && (!g.date_of_death || g.date_of_death < dateFrom)) return false;
        if (dateTo && (!g.date_of_death || g.date_of_death > dateTo)) return false;
        return true;
      });

      if (matches.length === 0) {
        setError("No grave found.");
        return;
      }

      if (matches.length === 1) {
        router.push(`/graves/${matches[0].id}`);
        return;
      }

      // Multiple matches — send them to the full list to browse/refine.
      router.push("/graves");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClasses =
    "h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black";

  return (
    <main>
      <section className="flex flex-col items-center px-6 pt-6">
        <div className="w-full max-w-[638px]">
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-900">Find Your Loved Ones</h1>

          <form onSubmit={handleSubmit} className="mt-10 w-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Grave ID"
                value={graveNumber}
                onChange={(e) => setGraveNumber(e.target.value)}
                className={fieldClasses}
              />
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClasses}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-64 rounded-lg bg-black text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Searching..." : "Find Grave"}
              </button>
            </div>

            {error && <p className="mt-4 text-red-600">{error}</p>}
          </form>
        </div>
      </section>

      <div className="mt-11">
        <Image
          src="/hands.png"
          alt="Hands"
          width={1800}
          height={500}
          className="w-full object-cover"
        />
      </div>
    </main>
  );
}