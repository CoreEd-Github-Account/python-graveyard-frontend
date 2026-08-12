// validations\grave_validation.ts
import { z } from "zod";

export const identificationTypeEnum = z.enum(["cnic", "passport", "nicop", "other"]);
export const genderEnum = z.enum(["male", "female", "others"], {
  message: "Please select a gender.",
});

// Used by both create and update forms now (no "other")
const identificationTypeCreateEnum = z.enum(["cnic", "passport", "nicop"], {
  message: "Please select an identification type.",
});

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDateOnly = (val: string) => {
  const d = new Date(val);
  d.setHours(0, 0, 0, 0);
  return d;
};

const lettersOnlyField = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`)
    .regex(/^[A-Za-z\s]+$/, `${label} must contain letters only, no numbers or symbols.`);

const optionalNumericMax = (label: string, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || new RegExp(`^\\d{1,${max}}$`).test(val),
      `${label} must be numeric, up to ${max} digits.`
    );

const requiredNumericMax = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(new RegExp(`^\\d{1,${max}}$`), `${label} must be numeric, up to ${max} digits.`);

const optionalAlphanumericMax = (label: string, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || new RegExp(`^[A-Za-z0-9-]{1,${max}}$`).test(val),
      `${label} must be alphanumeric, up to ${max} characters.`
    );

// ---- Shared field shape used by BOTH create and update ----
const graveInformerFields = {
  deceased_name: lettersOnlyField("Deceased name", 30),
  deceased_surname: lettersOnlyField("Deceased surname", 30),
  father_or_husband_name: lettersOnlyField("Father/Husband name", 30),
  native_place: z
    .string()
    .trim()
    .min(1, "Native place is required.")
    .max(50, "Native place must be at most 50 characters."),
  identification_type: identificationTypeCreateEnum,
  identification_number: requiredNumericMax("Identification number", 13),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required.")
    .refine((val) => parseDateOnly(val) <= todayStart(), "Date of birth cannot be in the future."),
  date_of_death: z
    .string()
    .min(1, "Date of death is required.")
    .refine((val) => parseDateOnly(val) <= todayStart(), "Date of death cannot be in the future."),
  date_buried: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || parseDateOnly(val) >= todayStart(), "Date buried cannot be before today."),
  gender: genderEnum,
  reason_of_death: z
    .string()
    .trim()
    .max(30, "Reason of death must be at most 30 characters.")
    .optional()
    .or(z.literal("")),
  grave_id: optionalNumericMax("Grave ID", 10),
  old_grave_id: optionalAlphanumericMax("Old grave ID", 10),
  google_map_location: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^[0-9,]{1,20}$/.test(val),
      "Google map location must contain only numbers and commas, up to 20 characters."
    ),
  zone_id: optionalAlphanumericMax("Zone", 10),
  islamic_date_of_death: z.string().trim().optional().or(z.literal("")),
  neighbor_grave_id_1: optionalNumericMax("Neighbor grave ID 1", 10),
  neighbor_grave_id_2: optionalNumericMax("Neighbor grave ID 2", 10),

  informer_full_name: lettersOnlyField("Informer full name", 30),
  relationship_with_deceased: lettersOnlyField("Relationship with deceased", 30),
  informer_cnic: requiredNumericMax("Informer CNIC", 13),
  informer_contact_number: requiredNumericMax("Contact number", 11),
  additional_contact_number: requiredNumericMax("Alt. contact number", 11),
  informer_address: z
    .string()
    .trim()
    .max(50, "Address must be at most 50 characters.")
    .optional()
    .or(z.literal("")),
  informer_city: lettersOnlyField("City", 20),
  informer_country: lettersOnlyField("Country", 20),
  form_received_by: z.string().trim().min(1, "Form received by is required."),
};

export const graveInformerCreateSchema = z
  .object(graveInformerFields)
  .refine(
    (data) => parseDateOnly(data.date_of_death) > parseDateOnly(data.date_of_birth),
    { message: "Date of death must be after date of birth.", path: ["date_of_death"] }
  );

export type GraveInformerCreateForm = z.infer<typeof graveInformerCreateSchema>;

export const graveInformerUpdateSchema = z
  .object(graveInformerFields)
  .refine(
    (data) => parseDateOnly(data.date_of_death) > parseDateOnly(data.date_of_birth),
    { message: "Date of death must be after date of birth.", path: ["date_of_death"] }
  );

export type GraveInformerUpdateForm = z.infer<typeof graveInformerUpdateSchema>;