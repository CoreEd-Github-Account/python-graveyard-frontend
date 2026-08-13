"use client";
import { useState } from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const SERVICE_TYPES = ["Grave Booking", "Maintenance", "Flowers Decoration", "Marble Work"];

// TODO: replace with your real contact details
const CONTACT_EMAIL = "abc@gmail.com";
const CONTACT_PHONE = "0345 1234567";

interface DirectoryTile {
  label: string;
  image: string;
}

const DIRECTORY_TILES: DirectoryTile[] = [
  { label: "Ambulance", image: "/Ambulance.png" },
  { label: "Shower Arrangement", image: "/Ghusl.png" },
  { label: "Bus Arrangement", image: "/Bus.png" },
  { label: "Masjid", image: "/Masjid.png" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-medium text-gray-900">{label}</label>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TODO: no backend endpoint exists yet for contact submissions.
    // This just simulates a successful send so the UI flow can be reviewed.
    // Replace with a real services/contact.ts call once that endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
    setLoading(false);
  }

  const inputClass =
    "h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none";

  return (
    <main className="mx-auto w-full max-w-[1360px] px-6 py-12 sm:px-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Left side */}
        <div>
          <h1 className="font-serif text-5xl text-gray-900 mb-6">We&apos;re Here To Help</h1>

          <p className="mb-8 text-[15px] leading-relaxed text-gray-500">
            Lorem ipsum dolor sit amet consectetur. Id suscipit odio egestas erat porttitor
            pulvinar justo dictumst. Cras sagitta nulla massa cras purus aliquet proin. Justo
            nulla cras vitae turpis eu lacus mauris mattis pretium.
          </p>

          <div className="mb-8 space-y-4">
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200">
                <Mail className="h-4 w-4" />
              </span>
              <span className="text-[15px] text-gray-900">{CONTACT_EMAIL}</span>
            </a>

            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200">
                <Phone className="h-4 w-4" />
              </span>
              <span className="text-[15px] text-gray-900">{CONTACT_PHONE}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {DIRECTORY_TILES.map((tile) => (
              <div key={tile.label} className="relative h-[180px] overflow-hidden rounded-xl">
                <Image src={tile.image} alt={tile.label} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right side - form */}
        <div className="rounded-2xl bg-gray-50 p-8 shadow-sm">
          <h2 className="font-serif text-3xl text-gray-900 mb-6">Let&apos;s Talk</h2>

          {submitted ? (
            <div className="py-12 text-center">
              <h3 className="font-serif text-2xl text-gray-900 mb-3">Message Sent</h3>
              <p className="text-gray-500">
                Thank you for reaching out. We&apos;ll get back to you at {form.phone} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Full name *">
                <input
                  required
                  className={inputClass}
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </Field>

              <Field label="Phone / WhatsApp Number *">
                <input
                  required
                  className={inputClass}
                  placeholder="e.g. 0321 25678903"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>

              <Field label="Service type *">
                <select
                  required
                  className={inputClass}
                  value={form.serviceType}
                  onChange={(e) => update("serviceType", e.target.value)}
                >
                  <option value="" disabled>
                    Select service type
                  </option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Message *">
                <textarea
                  required
                  rows={5}
                  className="w-full rounded-lg border border-gray-200 bg-white p-4 text-[15px] focus:border-black focus:outline-none"
                  placeholder="Write message here"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-black text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}