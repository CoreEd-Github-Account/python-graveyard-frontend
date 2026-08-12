// app\admin\login\page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginUser } from "@/services/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { access_token, user } = await loginUser({ email, password });

      // Cookie expiry (1 hour) matches the JWT's expiry, so when it
      // auto-deletes, the user is effectively logged out.
      document.cookie = `token=${access_token}; path=/; max-age=3600`;

      // For client-side UI only (Header, dashboard) — not used for route protection.
      const localStorageUser = {
        full_name: user.full_name,
        is_super_admin: user.is_super_admin,
        role_id: user.role_id,
      };
      localStorage.setItem("user", JSON.stringify(localStorageUser));

      if (user.is_super_admin) {
        router.push("/admin/super-admin/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">

            <h1 className="text-3xl font-bold text-gray-900">
              Log In
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login to your admin account
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Password *
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-16 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              {/* FORGOT PASSWORD */}
              {/* <div className="flex justify-end">
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-gray-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div> */}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-black font-medium text-white hover:bg-black/90 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden min-h-screen items-center justify-center p-8 lg:flex">

          <div className="relative h-full min-h-[600px] w-full overflow-hidden rounded-2xl">

            <Image
              src="/admin-login-bg.png"
              alt="Aerial view of the cemetery"
              fill
              priority
              className="object-cover"
            />

          </div>

        </div>

      </div>
    </main>
  );
}