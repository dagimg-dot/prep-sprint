import { NavLink, Route, Routes } from "react-router-dom";
import { Dashboard } from "@/pages/dashboard";
import { Stats } from "@/pages/stats";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            PrepSprint
          </NavLink>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Stats
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Layout>
  );
}
