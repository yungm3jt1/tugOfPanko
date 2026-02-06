import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (username) {
    redirect("/menu");
  } else {
    redirect("/login");
  }
}
