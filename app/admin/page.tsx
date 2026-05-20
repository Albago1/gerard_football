import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin – Video Dashboard",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  return (
    <div className="min-h-screen bg-[#080808]">
      {isAuthed ? (
        <AdminDashboard />
      ) : (
        <Suspense>
          <LoginForm />
        </Suspense>
      )}
    </div>
  );
}
