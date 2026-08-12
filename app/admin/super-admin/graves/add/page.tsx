// app\admin\super-admin\graves\add\page.tsx
"use client";

import { useRouter } from "next/navigation";
import { createGraveWithInformer } from "@/services/graves";
import { graveInformerCreateSchema } from "@/validations/grave_validation";
import { useEffect, useState } from "react";
import { getUsers, type UserData } from "@/services/users";

type FormErrors = Partial<Record<string, string>>;

const initialForm = {
  deceased_name: "",
  deceased_surname: "",
  father_or_husband_name: "",
  native_place: "",
  identification_type: "cnic",
  identification_number: "",
  date_of_birth: "",
  date_of_death: "",
  date_buried: "",
  gender: "",
  reason_of_death: "",
  grave_id: "",
  old_grave_id: "",
  google_map_location: "",
  zone_id: "",
  islamic_date_of_death: "",
  neighbor_grave_id_1: "",
  neighbor_grave_id_2: "",
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

const todayStr = new Date().toISOString().split("T")[0];

// Moved outside the component — defined once, not recreated on every render.
function Field({
  field,
  label,
  error,
  children,
}: {
  field: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AddGravePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [form, setForm] = useState(initialForm);

  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

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

    const result = graveInformerCreateSchema.safeParse(form);

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

      await createGraveWithInformer(payload as never);
      router.push("/admin/super-admin/graves/view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create grave record.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
      fieldErrors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-black focus:ring-black/10"
    }`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Add Grave Record</h1>

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
            <Field field="deceased_name" label="Deceased Name" error={fieldErrors.deceased_name}>
              <input
                name="deceased_name"
                value={form.deceased_name}
                onChange={handleChange}
                maxLength={15}
                className={inputClass("deceased_name")}
              />
            </Field>

            <Field field="deceased_surname" label="Deceased Surname" error={fieldErrors.deceased_surname}>
              <input
                name="deceased_surname"
                value={form.deceased_surname}
                onChange={handleChange}
                maxLength={15}
                className={inputClass("deceased_surname")}
              />
            </Field>

            <Field field="father_or_husband_name" label="Father/Husband Name" error={fieldErrors.father_or_husband_name}>
              <input
                name="father_or_husband_name"
                value={form.father_or_husband_name}
                onChange={handleChange}
                maxLength={15}
                className={inputClass("father_or_husband_name")}
              />
            </Field>

            <Field field="native_place" label="Native Place" error={fieldErrors.native_place}>
              <input
                name="native_place"
                value={form.native_place}
                onChange={handleChange}
                maxLength={25}
                className={inputClass("native_place")}
              />
            </Field>

            <Field field="identification_type" label="Identification Type" error={fieldErrors.identification_type}>
              <select
                name="identification_type"
                value={form.identification_type}
                onChange={handleChange}
                className={inputClass("identification_type")}
              >
                <option value="cnic">CNIC</option>
                <option value="passport">Passport</option>
                <option value="nicop">NICOP</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field field="identification_number" label="Identification Number" error={fieldErrors.identification_number}>
              <input
                name="identification_number"
                value={form.identification_number}
                onChange={handleChange}
                maxLength={13}
                inputMode="numeric"
                className={inputClass("identification_number")}
              />
            </Field>

            <Field field="date_of_birth" label="Date of Birth" error={fieldErrors.date_of_birth}>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                max={todayStr}
                className={inputClass("date_of_birth")}
              />
            </Field>

            <Field field="date_of_death" label="Date of Death" error={fieldErrors.date_of_death}>
              <input
                type="date"
                name="date_of_death"
                value={form.date_of_death}
                onChange={handleChange}
                max={todayStr}
                className={inputClass("date_of_death")}
              />
            </Field>

            <Field field="date_buried" label="Date Buried" error={fieldErrors.date_buried}>
              <input
                type="date"
                name="date_buried"
                value={form.date_buried}
                onChange={handleChange}
                min={todayStr}
                className={inputClass("date_buried")}
              />
            </Field>

            <Field field="gender" label="Gender" error={fieldErrors.gender}>
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
            </Field>

            <Field field="reason_of_death" label="Reason of Death" error={fieldErrors.reason_of_death}>
              <input
                name="reason_of_death"
                value={form.reason_of_death}
                onChange={handleChange}
                maxLength={25}
                className={inputClass("reason_of_death")}
              />
            </Field>

            <Field field="grave_id" label="Grave ID (optional)" error={fieldErrors.grave_id}>
              <input
                type="number"
                name="grave_id"
                value={form.grave_id}
                onChange={handleChange}
                className={inputClass("grave_id")}
              />
            </Field>

            <Field field="old_grave_id" label="Old Grave ID (optional)" error={fieldErrors.old_grave_id}>
              <input
                type="number"
                name="old_grave_id"
                value={form.old_grave_id}
                onChange={handleChange}
                className={inputClass("old_grave_id")}
              />
            </Field>

            <Field field="google_map_location" label="Google Map Location (optional)" error={fieldErrors.google_map_location}>
              <input
                name="google_map_location"
                value={form.google_map_location}
                onChange={handleChange}
                className={inputClass("google_map_location")}
              />
            </Field>

            <Field field="zone_id" label="Zone (optional)" error={fieldErrors.zone_id}>
              <input
                name="zone_id"
                value={form.zone_id}
                onChange={handleChange}
                className={inputClass("zone_id")}
              />
            </Field>

            <Field field="islamic_date_of_death" label="Islamic Date of Death (optional)" error={fieldErrors.islamic_date_of_death}>
              <input
                name="islamic_date_of_death"
                value={form.islamic_date_of_death}
                onChange={handleChange}
                className={inputClass("islamic_date_of_death")}
              />
            </Field>

            <Field field="neighbor_grave_id_1" label="Neighbor Grave ID 1 (optional)" error={fieldErrors.neighbor_grave_id_1}>
              <input
                type="number"
                name="neighbor_grave_id_1"
                value={form.neighbor_grave_id_1}
                onChange={handleChange}
                className={inputClass("neighbor_grave_id_1")}
              />
            </Field>

            <Field field="neighbor_grave_id_2" label="Neighbor Grave ID 2 (optional)" error={fieldErrors.neighbor_grave_id_2}>
              <input
                type="number"
                name="neighbor_grave_id_2"
                value={form.neighbor_grave_id_2}
                onChange={handleChange}
                className={inputClass("neighbor_grave_id_2")}
              />
            </Field>
          </div>
        </div>

        {/* Informer Details */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Informer Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field field="informer_full_name" label="Informer Full Name" error={fieldErrors.informer_full_name}>
              <input
                name="informer_full_name"
                value={form.informer_full_name}
                onChange={handleChange}
                className={inputClass("informer_full_name")}
              />
            </Field>

            <Field field="relationship_with_deceased" label="Relationship with Deceased" error={fieldErrors.relationship_with_deceased}>
              <input
                name="relationship_with_deceased"
                value={form.relationship_with_deceased}
                onChange={handleChange}
                className={inputClass("relationship_with_deceased")}
              />
            </Field>

            <Field field="informer_cnic" label="Informer CNIC" error={fieldErrors.informer_cnic}>
              <input
                name="informer_cnic"
                value={form.informer_cnic}
                onChange={handleChange}
                maxLength={13}
                inputMode="numeric"
                className={inputClass("informer_cnic")}
              />
            </Field>

            <Field field="informer_contact_number" label="Contact Number" error={fieldErrors.informer_contact_number}>
              <input
                name="informer_contact_number"
                value={form.informer_contact_number}
                onChange={handleChange}
                maxLength={11}
                inputMode="numeric"
                className={inputClass("informer_contact_number")}
              />
            </Field>

            <Field field="additional_contact_number" label="Alt. Contact Number" error={fieldErrors.additional_contact_number}>
              <input
                name="additional_contact_number"
                value={form.additional_contact_number}
                onChange={handleChange}
                maxLength={11}
                inputMode="numeric"
                className={inputClass("additional_contact_number")}
              />
            </Field>

            <Field field="informer_address" label="Address" error={fieldErrors.informer_address}>
              <input
                name="informer_address"
                value={form.informer_address}
                onChange={handleChange}
                className={inputClass("informer_address")}
              />
            </Field>

            <Field field="informer_city" label="City" error={fieldErrors.informer_city}>
              <input
                name="informer_city"
                value={form.informer_city}
                onChange={handleChange}
                className={inputClass("informer_city")}
              />
            </Field>

            <Field field="informer_country" label="Country" error={fieldErrors.informer_country}>
              <input
                name="informer_country"
                value={form.informer_country}
                onChange={handleChange}
                className={inputClass("informer_country")}
              />
            </Field>

            <Field field="form_received_by" label="Form Received By" error={fieldErrors.form_received_by}>
              <select
                name="form_received_by"
                value={form.form_received_by}
                onChange={handleChange}
                disabled={usersLoading}
                className={inputClass("form_received_by")}
              >
                <option value="">{usersLoading ? "Loading..." : "Select..."}</option>
                {users.map((user) => (
                  <option
                    key={user.id}
                    value={`${user.full_name} (${user.is_super_admin ? "Super Admin" : "Staff"})`}
                  >
                    {user.full_name} ({user.is_super_admin ? "Super Admin" : "Staff"})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 flex-1 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Record"}
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