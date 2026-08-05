import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Menu,
  Monitor,
  Moon,
  PieChart,
  Plus,
  Repeat,
  Search,
  Sparkles,
  Sun,
  Tags,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { brl, formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { useAtlas } from "@/lib/atlas-data";
import { Logo } from "./Logo";
import { QuickTransaction } from "./QuickTransaction";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lancamentos", label: "Lançamentos", icon: ArrowLeftRight },
  { to: "/fixas", label: "Despesas fixas", icon: Repeat },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/parcelamentos", label: "Parcelamentos", icon: ListChecks },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
  { to: "/resumo", label: "Resumo mensal", icon: ListChecks },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles },
] as const;

/** The five destinations that live in the mobile bottom bar (last slot = "Mais"). */
const MOBILE_TABS = ["/", "/lancamentos", "/cartoes", "/relatorios"] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data } = useAtlas();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && /input|textarea|select/i.test(target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (!typing && event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setQuickOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "press group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
            <span className="truncate">{item.label}</span>
            {active ? <span className="ml-auto size-1.5 rounded-full bg-primary" /> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        {sidebar}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Saldo atual
          </p>
          <p className="num mt-1 text-lg font-bold">
            {brl(
              data.accounts.reduce((sum, a) => sum + Number(a.saldo_inicial), 0) +
                data.transactions
                  .filter((t) => t.pago)
                  .reduce(
                    (sum, t) =>
                      sum +
                      (t.tipo === "receita" || t.tipo === "reembolso"
                        ? Number(t.valor)
                        : t.tipo === "despesa" || t.tipo === "parcelamento"
                          ? -Number(t.valor)
                          : 0),
                    0,
                  ),
            )}
          </p>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[264px] flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-sm"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Buscar em tudo...</span>
            <kbd className="ml-auto hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold sm:block">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button onClick={() => setQuickOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo lançamento</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Tema">
                  {theme === "dark" ? <Moon className="size-4" /> : theme === "light" ? <Sun className="size-4" /> : <Monitor className="size-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {(user?.email ?? "A").slice(0, 1).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/resumo" })}>Resumo mensal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Buscar páginas, lançamentos, categorias..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Ações">
            <CommandItem
              onSelect={() => {
                setPaletteOpen(false);
                setQuickOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" /> Novo lançamento
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navegação">
            {NAV.map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: item.to });
                }}
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Lançamentos recentes">
            {data.transactions.slice(0, 20).map((transaction) => (
              <CommandItem
                key={transaction.id}
                value={`${transaction.descricao} ${transaction.valor}`}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: "/lancamentos" });
                }}
              >
                <span className="truncate">{transaction.descricao}</span>
                <span className="num ml-auto text-xs text-muted-foreground">
                  {formatDate(transaction.data)} · {brl(Number(transaction.valor))}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <QuickTransaction open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
}