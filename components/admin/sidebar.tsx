// components\admin\sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Shield, ChevronDown } from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/super-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Grave Management",
    icon: Users,
    subItems: [
      { label: "View Graves", href: "/admin/super-admin/graves/view" },
      { label: "Add Grave", href: "/admin/super-admin/graves/add" },
      { label: "Deleted Graves", href: "/admin/super-admin/graves/deleted" },
    ],
  },
  {
    label: "Role Management",
    icon: Shield,
    subItems: [
      { label: "View Roles", href: "/admin/super-admin/roles/view" },
      { label: "Add Role", href: "/admin/super-admin/roles/add" },
      { label: "Deleted Roles", href: "/admin/super-admin/roles/deleted" },
    ],
  },
  {
    label: "User Management",
    icon: Users,
    subItems: [
      { label: "View Users", href: "/admin/super-admin/users/view" },
      { label: "Add User", href: "/admin/super-admin/users/add" },
      { label: "Deleted Users", href: "/admin/super-admin/users/deleted" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>("User Management");

  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">Super Admin Panel</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (!item.subItems) {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          }

          const isOpen = openMenu === item.label;

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => toggleMenu(item.label)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="mt-1 space-y-1 pl-11">
                  {item.subItems.map((sub) => {
                    const isActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          isActive
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}