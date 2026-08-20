// app\(public)\graves\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGraveWithInformer, type GraveInformerDetailData } from "@/services/graves";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value ?? "—"}</dd>
    </div>
  );
}

function formatDateDDMMYY(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function calculateAgeAtDeath(dobStr: string | null, dodStr: string | null): string | null {
  if (!dobStr || !dodStr) return null;

  const dob = new Date(dobStr);
  const dod = new Date(dodStr);

  let years = dod.getFullYear() - dob.getFullYear();
  let months = dod.getMonth() - dob.getMonth();
  let days = dod.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the month just before date of death, to borrow from.
    const prevMonth = new Date(dod.getFullYear(), dod.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return null; // dates out of order — don't show a nonsensical age

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return parts.join(", ");
}

export default function GraveDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [grave, setGrave] = useState<GraveInformerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGraveWithInformer(id)
      .then((data) => {
        // Pending public reservations (no plot assigned yet) aren't
        // published — same rule the list page already enforces.
        if (data.grave_id === null) {
          setError("Record not found.");
          return;
        }
        setGrave(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Record not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const ageAtDeath = grave
    ? calculateAgeAtDeath(grave.date_of_birth, grave.date_of_death)
    : null;

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-12 sm:px-10">
      <Link href="/graves" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to Grave List
      </Link>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading record...</p>}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && grave && (
        <>
          <h1 className="font-serif text-5xl text-gray-900 mt-4 mb-8">
            {grave.deceased_name} {grave.deceased_surname ?? ""}
          </h1>

          <div className="rounded-2xl bg-gray-50 p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Deceased / Grave Details</h2>
            <dl>
              <DetailRow label="Deceased Name" value={grave.deceased_name} />
              <DetailRow label="Surname" value={grave.deceased_surname} />
              <DetailRow label="Father/Husband Name" value={grave.father_or_husband_name} />
              <DetailRow label="Gender" value={grave.gender} />
              <DetailRow label="Native Place" value={grave.native_place} />
              <DetailRow label="Date of Birth" value={formatDateDDMMYY(grave.date_of_birth)} />
              <DetailRow label="Date of Death" value={formatDateDDMMYY(grave.date_of_death)} />
              <DetailRow label="Age at Death" value={ageAtDeath} />
              <DetailRow label="Grave ID" value={grave.grave_id} />
              <DetailRow label="Old Grave ID" value={grave.old_grave_id} />
              <DetailRow label="Zone" value={grave.zone_id} />
              <DetailRow label="Neighbor Grave ID 1" value={grave.neighbor_grave_id_1} />
              <DetailRow label="Neighbor Grave ID 2" value={grave.neighbor_grave_id_2} />
            </dl>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Informer Details</h2>
            <dl>
              <DetailRow label="Informer Full Name" value={grave.informer_full_name} />
              <DetailRow label="Relationship with Deceased" value={grave.relationship_with_deceased} />
            </dl>
          </div>
        </>
      )}
    </main>
  );
}