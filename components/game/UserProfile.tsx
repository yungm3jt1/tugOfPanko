// components/game/UserProfile.tsx
import React from "react";

interface UserProfileProps {
  username: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  return (
    <div className="absolute bottom-2 right-2 pointer-events-none z-20">
      <span className="font-pixel bg-black/70 text-orange-300 px-3 py-1 text-[10px] border border-orange-500/50">
        ⚔ {username}
      </span>
    </div>
  );
};

export default UserProfile;
