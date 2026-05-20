import { cookies } from "next/headers";

// Returns true only when ADMIN_PASSWORD is set AND the request carries a valid session cookie.
// The double guard on !!ADMIN_PASSWORD prevents undefined === undefined matching.
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return (
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD
  );
}
