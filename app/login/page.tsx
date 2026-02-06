"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        router.push("/menu");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black gap-20 px-5">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

        .pixel-font {
          font-family: "Press Start 2P", cursive;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        .pixel-border {
          box-shadow:
            0 -4px 0 0 #ffa500,
            4px 0 0 0 #ffa500,
            0 4px 0 0 #ffa500,
            -4px 0 0 0 #ffa500;
        }

        .pixel-button {
          box-shadow:
            0 -6px 0 0 #000,
            6px 0 0 0 #000,
            0 6px 0 0 #000,
            -6px 0 0 0 #000,
            0 -4px 0 0 #ff8c00,
            4px 0 0 0 #ff8c00,
            0 4px 0 0 #ff8c00,
            -4px 0 0 0 #ff8c00;
        }

        .pixel-button:hover {
          box-shadow:
            0 -6px 0 0 #000,
            6px 0 0 0 #000,
            0 6px 0 0 #000,
            -6px 0 0 0 #000,
            0 -4px 0 0 #ffa500,
            4px 0 0 0 #ffa500,
            0 4px 0 0 #ffa500,
            -4px 0 0 0 #ffa500;
        }
      `}</style>

      {/* left */}
      <div className="flex flex-col gap-8 max-w-125">
        <h1 className="text-[#FFA500] text-3xl m-0 font-bold pixel-font leading-relaxed">
          Join the Battle
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="username"
              className="text-white block mb-3 text-sm pixel-font"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-4 w-full bg-[#1a1a1a] border-0 text-white text-base outline-none pixel-font pixel-border focus:shadow-[0_-4px_0_0_#FF8C00,4px_0_0_0_#FF8C00,0_4px_0_0_#FF8C00,-4px_0_0_0_#FF8C00] transition-shadow"
            />
          </div>
          <button
            type="submit"
            className="py-4 px-6 cursor-pointer bg-[#FFA500] text-black border-none text-base font-bold pixel-font pixel-button hover:bg-[#FF8C00] hover:translate-y-0.5 transition-all active:translate-y-0.5"
          >
            Join Game
          </button>
        </form>
      </div>

      {/* Logo (right) */}
      <div className="flex items-center justify-center">
        <Image
          src="/logo_main.png"
          alt="Tug of Panko Logo"
          width={400}
          height={400}
          priority
          className="drop-shadow-[0_0_30px_rgba(255,165,0,0.5)]"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
