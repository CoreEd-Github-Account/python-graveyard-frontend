// components\admin\DynamicSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, MapPin } from "lucide-react";
import { getRoleById, type RolePermissions } from "@/services/roles";

// Maps a permission-matrix module key to its real pages.
// Add new entries here as more modules get added to the Roles system.
const MODULE_CONFIG: Record<
  string,
  { label: string; icon: typeof Users; viewPath: string; addPath: string }
> = {
  users: {
    label: "User Management",
    icon: Users,
    viewPath: "/admin/dashboard/users/view",
    addPath: "/admin/dashboard/users/add",
  },
  graves: {
    label: "Grave Management",
    icon: MapPin,
    viewPath: "/admin/dashboard/graves/view",
    addPath: "/admin/dashboard/graves/add",
  },
};

interface StoredUser {
  full_name: string;
  is_super_admin: boolean;
  role_id: string | null;
}

export default function DynamicSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/admin/login");
      return;
    }

    let user: StoredUser;
    try {
      user = JSON.parse(stored);
    } catch {
      router.push("/admin/login");
      return;
    }

    if (user.is_super_admin) {
      router.push("/admin/super-admin/dashboard");
      return;
    }

    if (!user.role_id) {
      setError("No role assigned to this account. Contact your administrator.");
      setLoading(false);
      return;
    }

    getRoleById(user.role_id)
      .then((role) => setPermissions(role.permissions))
      .catch(() => setError("Failed to load permissions."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            pathname === "/admin/dashboard"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {loading && <p className="px-3 py-2 text-sm text-gray-400">Loading menu...</p>}

        {error && <p className="px-3 py-2 text-sm text-red-600">{error}</p>}

        {!loading &&
          !error &&
          permissions &&
          Object.entries(MODULE_CONFIG).map(([moduleKey, config]) => {
            const modulePerms = permissions[moduleKey];
            if (!modulePerms) return null;

            const hasAnyPermission =
              modulePerms.view || modulePerms.add || modulePerms.edit || modulePerms.delete;
            if (!hasAnyPermission) return null;

            const Icon = config.icon;

            return (
              <div key={moduleKey} className="pt-2">
                <div className="flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-gray-700">
                  <Icon size={18} />
                  {config.label}
                </div>
                <div className="mt-1 space-y-1 pl-11">
                  {modulePerms.view && (
                    <Link
                      href={config.viewPath}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        pathname === config.viewPath
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      View {config.label.replace(" Management", "")}
                    </Link>
                  )}
                  {modulePerms.add && (
                    <Link
                      href={config.addPath}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        pathname === config.addPath
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Add {config.label.replace(" Management", "")}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
      </nav>
    </aside>
  );
}