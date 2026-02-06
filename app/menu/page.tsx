import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GameLobby from "@/components/GameLobby";

export default async function MenuPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Main Menu</h1>
      <p>
        Welcome, <strong>{username}</strong>!
      </p>

      <GameLobby username={username} />
    </div>
  );
}
