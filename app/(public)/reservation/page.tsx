"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { createGraveWithInformer, type CreateGraveInformerPayload } from "@/services/graves";
import { graveInformerCreateSchema } from "@/validations/grave_validation";

// TODO: replace with your real WhatsApp business number, digits only, country code first (e.g. "923001234567")
const WHATSAPP_NUMBER = "923001234567";

type FormErrors = Partial<Record<string, string>>;

const todayStr = new Date().toISOString().split("T")[0];

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
  // Staff-assigned fields — not shown to public visitors, left blank and
  // filled in later by an admin once the plot is actually allocated.
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
  // Auto-filled, not a visible field — flags this record as a public
  // self-service submission rather than one entered by staff.
  form_received_by: "Public Website Reservation",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-medium text-gray-900">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ReservationPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
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

    setLoading(true);

    try {
      const numericFields = ["grave_id", "neighbor_grave_id_1", "neighbor_grave_id_2"];

      const payload = Object.fromEntries(
        Object.entries(result.data)
          .filter(([, value]) => value !== "")
          .map(([key, value]) =>
            numericFields.includes(key) ? [key, Number(value)] : [key, value]
          )
      );

      await createGraveWithInformer(payload as CreateGraveInformerPayload);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit reservation.");
    } finally {
      setLoading(false);
    }
  }

  function openWhatsapp() {
    const message = encodeURIComponent("Hi, I'd like to book a grave reservation.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  const inputClass = (field: string) =>
    `h-12 rounded-lg border bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none ${
      fieldErrors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-black"
    }`;

  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto w-full max-w-[1360px] flex-1 px-6 py-8 sm:px-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="font-serif text-5xl text-gray-900">Grave Reservation Form</h1>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 lg:min-w-[550px]">
            <span className="pr-4 font-serif text-3xl text-gray-900">Prefer Instant Booking?</span>

            <button
              type="button"
              onClick={openWhatsapp}
              className="flex items-center gap-3 rounded-lg bg-[#25D366] px-6 py-3 font-medium text-white transition hover:bg-[#20ba5a]"
            >
              <FaWhatsapp className="h-6 w-6" />
              <span>Book via WhatsApp</span>
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-gray-50 p-12 text-center shadow-sm">
            <h2 className="font-serif text-3xl text-gray-900 mb-3">Request Received</h2>
            <p className="text-gray-500">
              Thank you. Our team will review your submission and contact you shortly to confirm
              details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-gray-50 p-6 shadow-sm">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* About the Deceased */}
            <div className="mb-8">
              <h2 className="mb-4 font-serif text-2xl text-gray-900">About the Deceased</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Deceased Name *" error={fieldErrors.deceased_name}>
                  <input
                    name="deceased_name"
                    value={form.deceased_name}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="Enter deceased's first name"
                    className={inputClass("deceased_name")}
                  />
                </Field>

                <Field label="Deceased Surname *" error={fieldErrors.deceased_surname}>
                  <input
                    name="deceased_surname"
                    value={form.deceased_surname}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="Enter deceased's surname"
                    className={inputClass("deceased_surname")}
                  />
                </Field>

                <Field label="Father/Husband Name *" error={fieldErrors.father_or_husband_name}>
                  <input
                    name="father_or_husband_name"
                    value={form.father_or_husband_name}
                    onChange={handleChange}
                    maxLength={15}
                    className={inputClass("father_or_husband_name")}
                  />
                </Field>

                <Field label="Native Place *" error={fieldErrors.native_place}>
                  <input
                    name="native_place"
                    value={form.native_place}
                    onChange={handleChange}
                    maxLength={25}
                    className={inputClass("native_place")}
                  />
                </Field>

                <Field label="Identification Type *" error={fieldErrors.identification_type}>
                  <select
                    name="identification_type"
                    value={form.identification_type}
                    onChange={handleChange}
                    className={inputClass("identification_type")}
                  >
                    <option value="cnic">CNIC</option>
                    <option value="passport">Passport</option>
                    <option value="nicop">NICOP</option>
                  </select>
                </Field>

                <Field label="Identification Number *" error={fieldErrors.identification_number}>
                  <input
                    name="identification_number"
                    value={form.identification_number}
                    onChange={handleChange}
                    maxLength={13}
                    inputMode="numeric"
                    className={inputClass("identification_number")}
                  />
                </Field>

                <Field label="Date of Birth *" error={fieldErrors.date_of_birth}>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    max={todayStr}
                    className={inputClass("date_of_birth")}
                  />
                </Field>

                <Field label="Date of Death *" error={fieldErrors.date_of_death}>
                  <input
                    type="date"
                    name="date_of_death"
                    value={form.date_of_death}
                    onChange={handleChange}
                    max={todayStr}
                    className={inputClass("date_of_death")}
                  />
                </Field>

                <Field label="Gender *" error={fieldErrors.gender}>
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

                <Field label="Reason of Death (optional)" error={fieldErrors.reason_of_death}>
                  <input
                    name="reason_of_death"
                    value={form.reason_of_death}
                    onChange={handleChange}
                    maxLength={25}
                    className={inputClass("reason_of_death")}
                  />
                </Field>

                <Field label="Preferred Burial Date (optional)" error={fieldErrors.date_buried}>
                  <input
                    type="date"
                    name="date_buried"
                    value={form.date_buried}
                    onChange={handleChange}
                    min={todayStr}
                    className={inputClass("date_buried")}
                  />
                </Field>
              </div>
            </div>

            {/* Your Details (Informer) */}
            <div>
              <h2 className="mb-4 font-serif text-2xl text-gray-900">Your Details</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full Name *" error={fieldErrors.informer_full_name}>
                  <input
                    name="informer_full_name"
                    value={form.informer_full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass("informer_full_name")}
                  />
                </Field>

                <Field label="Relationship with Deceased *" error={fieldErrors.relationship_with_deceased}>
                  <input
                    name="relationship_with_deceased"
                    value={form.relationship_with_deceased}
                    onChange={handleChange}
                    placeholder="e.g. Son, Daughter, Spouse"
                    className={inputClass("relationship_with_deceased")}
                  />
                </Field>

                <Field label="Your CNIC *" error={fieldErrors.informer_cnic}>
                  <input
                    name="informer_cnic"
                    value={form.informer_cnic}
                    onChange={handleChange}
                    maxLength={13}
                    inputMode="numeric"
                    className={inputClass("informer_cnic")}
                  />
                </Field>

                <Field label="Phone / WhatsApp Number *" error={fieldErrors.informer_contact_number}>
                  <input
                    name="informer_contact_number"
                    value={form.informer_contact_number}
                    onChange={handleChange}
                    maxLength={11}
                    inputMode="numeric"
                    placeholder="03xx xxxxxxx"
                    className={inputClass("informer_contact_number")}
                  />
                </Field>

                <Field label="Alternate Contact Number *" error={fieldErrors.additional_contact_number}>
                  <input
                    name="additional_contact_number"
                    value={form.additional_contact_number}
                    onChange={handleChange}
                    maxLength={11}
                    inputMode="numeric"
                    placeholder="03xx xxxxxxx"
                    className={inputClass("additional_contact_number")}
                  />
                </Field>

                <Field label="City *" error={fieldErrors.informer_city}>
                  <input
                    name="informer_city"
                    value={form.informer_city}
                    onChange={handleChange}
                    className={inputClass("informer_city")}
                  />
                </Field>

                <Field label="Country *" error={fieldErrors.informer_country}>
                  <input
                    name="informer_country"
                    value={form.informer_country}
                    onChange={handleChange}
                    className={inputClass("informer_country")}
                  />
                </Field>

                <Field label="Address (optional)" error={fieldErrors.informer_address}>
                  <input
                    name="informer_address"
                    value={form.informer_address}
                    onChange={handleChange}
                    className={inputClass("informer_address")}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full rounded-lg bg-black text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}