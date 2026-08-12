// app\admin\super-admin\graves\edit\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getGraveWithInformer,
  updateGraveWithInformer,
} from "@/services/graves";
import { graveInformerUpdateSchema } from "@/validations/grave_validation";


type FormErrors = Partial<Record<string, string>>;

const initialForm = {
  grave_id: "",
  old_grave_id: "",
  google_map_location: "",
  zone_id: "",
  deceased_name: "",
  deceased_surname: "",
  father_or_husband_name: "",
  date_of_birth: "",
  date_of_death: "",
  date_buried: "",
  islamic_date_of_death: "",
  identification_type: "",
  identification_number: "",
  gender: "",
  reason_of_death: "",
  neighbor_grave_id_1: "",
  neighbor_grave_id_2: "",
  native_place: "",
  informer_full_name: "",
  relationship_with_deceased: "",
  informer_cnic: "",
  informer_contact_number: "",
  additional_contact_number: "",
  informer_address: "",
  informer_city: "",
  informer_country: "",
  form_received_by: "",
};

export default function EditGravePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    getGraveWithInformer(id)
      .then((data) => {
        setForm({
          grave_id: data.grave_id?.toString() ?? "",
          old_grave_id: data.old_grave_id ?? "",
          google_map_location: data.google_map_location ?? "",
          zone_id: data.zone_id ?? "",
          deceased_name: data.deceased_name ?? "",
          deceased_surname: data.deceased_surname ?? "",
          father_or_husband_name: data.father_or_husband_name ?? "",
          date_of_birth: data.date_of_birth ?? "",
          date_of_death: data.date_of_death ?? "",
          date_buried: data.date_buried ?? "",
          islamic_date_of_death: data.islamic_date_of_death ?? "",
          identification_type: data.identification_type ?? "",
          identification_number: data.identification_number ?? "",
          gender: data.gender ?? "",
          reason_of_death: data.reason_of_death ?? "",
          neighbor_grave_id_1: data.neighbor_grave_id_1?.toString() ?? "",
          neighbor_grave_id_2: data.neighbor_grave_id_2?.toString() ?? "",
          native_place: data.native_place ?? "",
          informer_full_name: data.informer_full_name ?? "",
          relationship_with_deceased: data.relationship_with_deceased ?? "",
          informer_cnic: data.informer_cnic ?? "",
          informer_contact_number: data.informer_contact_number ?? "",
          additional_contact_number: data.additional_contact_number ?? "",
          informer_address: data.informer_address ?? "",
          informer_city: data.informer_city ?? "",
          informer_country: data.informer_country ?? "",
          form_received_by: data.form_received_by ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load record."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = graveInformerUpdateSchema.safeParse(form);

    if (!result.success) {
      const errors: FormErrors = {};
      for (const issue of result.error.issues) {
        errors[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    try {
      const numericFields = ["grave_id", "neighbor_grave_id_1", "neighbor_grave_id_2"];

      const payload = Object.fromEntries(
        Object.entries(result.data)
          .filter(([, value]) => value !== "")
          .map(([key, value]) =>
            numericFields.includes(key) ? [key, Number(value)] : [key, value]
          )
      );

      await updateGraveWithInformer(id, payload);
      router.push("/admin/super-admin/graves/view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading record...</p>;
  }

  const inputClass = (field: string) =>
    `h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
      fieldErrors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-black focus:ring-black/10"
    }`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Edit Grave Record</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Deceased / Grave Details */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Deceased / Grave Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["deceased_name", "Deceased Name"],
              ["deceased_surname", "Deceased Surname"],
              ["father_or_husband_name", "Father/Husband Name"],
              ["old_grave_id", "Old Grave ID"],
              ["zone_id", "Zone"],
              ["google_map_location", "Google Map Location"],
              ["native_place", "Native Place"],
              ["reason_of_death", "Reason of Death"],
              ["identification_number", "ID Number"],
              ["islamic_date_of_death", "Islamic Date of Death"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">{label}</label>
                <input
                  name={field}
                  value={form[field as keyof typeof form]}
                  onChange={handleChange}
                  className={inputClass(field)}
                />
                {fieldErrors[field] && (
                  <p className="text-xs text-red-600">{fieldErrors[field]}</p>
                )}
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Grave ID</label>
              <input
                type="number"
                name="grave_id"
                value={form.grave_id}
                onChange={handleChange}
                className={inputClass("grave_id")}
              />
              {fieldErrors.grave_id && (
                <p className="text-xs text-red-600">{fieldErrors.grave_id}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Neighbor Grave ID 1</label>
              <input
                type="number"
                name="neighbor_grave_id_1"
                value={form.neighbor_grave_id_1}
                onChange={handleChange}
                className={inputClass("neighbor_grave_id_1")}
              />
              {fieldErrors.neighbor_grave_id_1 && (
                <p className="text-xs text-red-600">{fieldErrors.neighbor_grave_id_1}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Neighbor Grave ID 2</label>
              <input
                type="number"
                name="neighbor_grave_id_2"
                value={form.neighbor_grave_id_2}
                onChange={handleChange}
                className={inputClass("neighbor_grave_id_2")}
              />
              {fieldErrors.neighbor_grave_id_2 && (
                <p className="text-xs text-red-600">{fieldErrors.neighbor_grave_id_2}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Identification Type</label>
              <select
                name="identification_type"
                value={form.identification_type}
                onChange={handleChange}
                className={inputClass("identification_type")}
              >
                <option value="">Select...</option>
                <option value="cnic">CNIC</option>
                <option value="passport">Passport</option>
                <option value="nicop">NICOP</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass("gender")}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
              {fieldErrors.gender && (
                <p className="text-xs text-red-600">{fieldErrors.gender}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className={inputClass("date_of_birth")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Date of Death</label>
              <input
                type="date"
                name="date_of_death"
                value={form.date_of_death}
                onChange={handleChange}
                className={inputClass("date_of_death")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Date Buried</label>
              <input
                type="date"
                name="date_buried"
                value={form.date_buried}
                onChange={handleChange}
                className={inputClass("date_buried")}
              />
            </div>
          </div>
        </div>

        {/* Informer Details */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Informer Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["informer_full_name", "Informer Full Name"],
              ["relationship_with_deceased", "Relationship with Deceased"],
              ["informer_cnic", "Informer CNIC"],
              ["informer_contact_number", "Contact Number"],
              ["additional_contact_number", "Alt. Contact Number"],
              ["informer_address", "Address"],
              ["informer_city", "City"],
              ["informer_country", "Country"],
              ["form_received_by", "Form Received By"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">{label}</label>
                <input
                  name={field}
                  value={form[field as keyof typeof form]}
                  onChange={handleChange}
                  className={inputClass(field)}
                />
                {fieldErrors[field] && (
                  <p className="text-xs text-red-600">{fieldErrors[field]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 flex-1 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/super-admin/graves/view")}
            className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}