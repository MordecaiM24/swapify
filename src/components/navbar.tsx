import { NavLink } from "react-router-dom";
import { BookOpen, MessageSquare, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const links = [
    { to: "/", label: "Books", icon: BookOpen },
    { to: "/chat", label: "Messages", icon: MessageSquare },
    { to: "/user", label: "User", icon: User },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink key={"Books"} to={"/"}>
            <span className="text-2xl">Swapify</span>
          </NavLink>

          <div className="flex items-center gap-4">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
