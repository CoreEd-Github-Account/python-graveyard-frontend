// app\admin\super-admin\graves\details\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGraveWithInformer, type GraveInformerDetailData } from "@/services/graves";

export default function GraveDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [grave, setGrave] = useState<GraveInformerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGraveWithInformer(id)
      .then(setGrave)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load record."))
      .finally(() => setLoading(false));
  }, [id]);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );

  if (loading) {
    return <p className="text-sm text-gray-500">Loading record...</p>;
  }

  if (error || !grave) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {error ?? "Record not found."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Grave Record Details</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/super-admin/graves/edit/${grave.id}`)}
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/super-admin/graves/view")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">Deceased / Grave Details</h2>
        <div className="rounded-xl border border-gray-200 px-4">
          <Row label="Deceased Name" value={`${grave.deceased_name} ${grave.deceased_surname ?? ""}`} />
          <Row label="Father/Husband Name" value={grave.father_or_husband_name} />
          <Row label="Native Place" value={grave.native_place} />
          <Row label="Gender" value={grave.gender} />
          <Row label="Reason of Death" value={grave.reason_of_death} />
          <Row label="Identification Type" value={grave.identification_type} />
          <Row label="Identification Number" value={grave.identification_number} />
          <Row label="Date of Birth" value={grave.date_of_birth} />
          <Row label="Date of Death" value={grave.date_of_death} />
          <Row label="Date Buried" value={grave.date_buried} />
          <Row label="Islamic Date of Death" value={grave.islamic_date_of_death} />
          <Row label="Grave ID" value={grave.grave_id} />
          <Row label="Old Grave ID" value={grave.old_grave_id} />
          <Row label="Zone" value={grave.zone_id} />
          <Row label="Neighbor Grave ID 1" value={grave.neighbor_grave_id_1} />
          <Row label="Neighbor Grave ID 2" value={grave.neighbor_grave_id_2} />
          <Row label="Google Map Location" value={grave.google_map_location} />
          <Row label="Record Created At" value={new Date(grave.created_at).toLocaleString()} />
          <Row label="Record Updated At" value={new Date(grave.updated_at).toLocaleString()} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">Informer Details</h2>
        <div className="rounded-xl border border-gray-200 px-4">
          <Row label="Informer Full Name" value={grave.informer_full_name} />
          <Row label="Relationship with Deceased" value={grave.relationship_with_deceased} />
          <Row label="Informer CNIC" value={grave.informer_cnic} />
          <Row label="Contact Number" value={grave.informer_contact_number} />
          <Row label="Alt. Contact Number" value={grave.additional_contact_number} />
          <Row label="Address" value={grave.informer_address} />
          <Row label="City" value={grave.informer_city} />
          <Row label="Country" value={grave.informer_country} />
          <Row label="Form Received By" value={grave.form_received_by} />
        </div>
      </div>
    </div>
  );
}