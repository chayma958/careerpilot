import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./LogoMark";
import { ApplicationsIcon } from "./icons/ApplicationsIcon";
import { DashboardIcon } from "./icons/DashboardIcon";
import { KanbanIcon } from "./icons/KanbanIcon";
import { DocumentsIcon } from "./icons/DocumentsIcon";
import { CalendarIcon } from "./icons/CalendarIcon";

const navItems = [
  { to: "/", label: "Dashboard", Icon: DashboardIcon },
  { to: "/applications", label: "Applications", Icon: ApplicationsIcon },
  { to: "/kanban", label: "Kanban", Icon: KanbanIcon },
  { to: "/documents", label: "Documents", Icon: DocumentsIcon },
  { to: "/calendar", label: "Calendar", Icon: CalendarIcon },
];

export function AppLayout() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2 font-brand text-lg font-semibold text-orange-500 dark:text-orange-400">
          <LogoMark />
          CareerPilot
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-950 dark:text-orange-300"
                    : "border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`
              }
            >
              <item.Icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="truncate text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-end gap-1 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
          <ThemeToggle />
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
