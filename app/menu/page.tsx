import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

      <div style={{ marginTop: "20px" }}>
        <p>Socket.io connection will be established here.</p>
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Start Game
        </button>
      </div>
    </div>
  );
}
