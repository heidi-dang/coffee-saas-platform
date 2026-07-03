"use client";

import { MenuIcon } from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center px-4 lg:hidden">
      <button
        onClick={onToggleSidebar}
        className="p-2 -ml-2 hover:bg-accent rounded-lg"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
    </header>
  );
}
