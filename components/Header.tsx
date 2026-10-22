import HeaderBar from "./HeaderBar";
import { getCartCount, getUser } from "@/lib/data";

export default async function Header() {
  const [user, count] = await Promise.all([getUser(), getCartCount()]);
  return <HeaderBar count={count} isLogged={!!user} firstName={user?.first_name ?? null} isAdmin={user?.role === "admin"} />;
}
