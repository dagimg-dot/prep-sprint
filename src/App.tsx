import { NavLink, Route, Routes } from "react-router-dom";
import { DataActions } from "@/components/data-actions";
import { Dashboard } from "@/pages/dashboard";
import { Stats } from "@/pages/stats";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
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
          <div className="flex items-center gap-2">
            <DataActions />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-6">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-8 py-4 text-center text-xs text-muted-foreground">
          Made with 🧡 by{" "}
          <a
            href="https://github.com/dagimg-dot"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            dagimg-dot
          </a>
        </div>
      </footer>
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
