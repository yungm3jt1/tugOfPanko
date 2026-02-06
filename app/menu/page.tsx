import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MenuPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  } else {
    redirect("/game");
  }

  return null;
}
