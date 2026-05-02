import React, { useState } from "react";
import { cn } from "../lib/utils";
import { getTeamColor } from "../data/fallback";

interface Props {
  name: string;
  logoUrl?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const TeamLogo: React.FC<Props> = ({ name, logoUrl, className, size = "md" }) => {
  const [error, setError] = useState(false);

  const sizes = {
    xs: "w-3 h-3 text-[5px]",
    sm: "w-4 h-4 text-[6px]",
    md: "w-6 h-6 text-[8px]",
    lg: "w-10 h-10 text-[12px]",
    xl: "w-16 h-16 text-[18px]",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error || !logoUrl) {
    return (
      <div 
        className={cn(
          "rounded-full flex items-center justify-center font-black text-white shadow-sm border border-white/10",
          sizes[size],
          getTeamColor(name),
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={cn("relative shrink-0", sizes[size], className)}>
      <img
        src={logoUrl}
        alt={name}
        onError={() => setError(true)}
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
