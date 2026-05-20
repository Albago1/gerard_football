"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    const store = await cookies();
    store.set("admin_token", process.env.ADMIN_PASSWORD!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect("/admin");
  }
  redirect("/admin?error=1");
}

export async function logout() {
  const store = await cookies();
  store.delete("admin_token");
  redirect("/admin");
}
