"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUser } from "@/services/users";
import { getRoles, type RoleData } from "@/services/roles";
import { createUserSchema } from "@/validations/user";

type FormErrors = Partial<
  Record<"full_name" | "email" | "password" | "confirm_password" | "phone" | "role_id", string>
>;

export default function AddUserPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    role_id: "",
    is_super_admin: false,
  });

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSuperAdminToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      is_super_admin: checked,
      role_id: checked ? "" : prev.role_id,
    }));
    setFieldErrors((prev) => ({ ...prev, role_id: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = createUserSchema.safeParse(form);

    if (!result.success) {
      const errors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    try {
      await createUser({
        full_name: result.data.full_name,
        email: result.data.email,
        password: result.data.password,
        phone: result.data.phone || undefined,
        role_id: result.data.is_super_admin ? null : result.data.role_id,
        is_super_admin: result.data.is_super_admin,
      });
      router.push("/admin/dashboard/users/view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold text-gray-900">Add User</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className={`h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
              fieldErrors.full_name
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-black focus:ring-black/10"
            }`}
          />
          {fieldErrors.full_name && (
            <p className="text-xs text-red-600">{fieldErrors.full_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
              fieldErrors.email
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-black focus:ring-black/10"
            }`}
          />
          {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`h-12 w-full rounded-xl border px-4 pr-12 text-sm outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-black focus:ring-black/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
          <div className="relative">
            <input
              name="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`h-12 w-full rounded-xl border px-4 pr-12 text-sm outline-none focus:ring-2 ${
                fieldErrors.confirm_password
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-black focus:ring-black/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.confirm_password && (
            <p className="text-xs text-red-600">{fieldErrors.confirm_password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            maxLength={11}
            inputMode="numeric"
            className={`h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
              fieldErrors.phone
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-black focus:ring-black/10"
            }`}
          />
          {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
          <input
            id="is_super_admin"
            type="checkbox"
            checked={form.is_super_admin}
            onChange={(e) => handleSuperAdminToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="is_super_admin" className="text-sm font-medium text-gray-900">
            This user is a Super Admin
          </label>
        </div>

        {!form.is_super_admin && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Role</label>
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              disabled={rolesLoading}
              className={`h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 ${
                fieldErrors.role_id
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-black focus:ring-black/10"
              }`}
            >
              <option value="">{rolesLoading ? "Loading..." : "Select a role..."}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {fieldErrors.role_id && (
              <p className="text-xs text-red-600">{fieldErrors.role_id}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-12 flex-1 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/users/view")}
            className="h-12 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}