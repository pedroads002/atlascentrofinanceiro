import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScriptOnce,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider, themeScript } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/atlas/AppShell";
import { LoginScreen } from "@/components/atlas/LoginScreen";
import { Logo } from "@/components/atlas/Logo";
import { Toaster } from "@/components/ui/sonner";
import { useAtlas, useBootstrapWorkspace } from "@/lib/atlas-data";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atlas - Seu Centro Financeiro" },
      {
        name: "description",
        content: "Seu centro de comando financeiro. Controle total. Decisões melhores. Veja para onde seu dinheiro vai. Decida para onde ele deve ir.",
      },
      { name: "author", content: "Atlas Finance" },
      { property: "og:title", content: "Atlas - Seu Centro Financeiro" },
      {
        property: "og:description",
        content: "Seu centro de comando financeiro. Controle total. Decisões melhores. Veja para onde seu dinheiro vai. Decida para onde ele deve ir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Atlas - Seu Centro Financeiro" },
      { name: "twitter:description", content: "Seu centro de comando financeiro. Controle total. Decisões melhores. Veja para onde seu dinheiro vai. Decida para onde ele deve ir." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/77b25a6e-7371-4828-b8c5-0d0b4989979f/id-preview-a5ed2ffe--e9cfc41b-6952-4b0d-a5d0-1688b729e759.lovable.app-1785923040290.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/77b25a6e-7371-4828-b8c5-0d0b4989979f/id-preview-a5ed2ffe--e9cfc41b-6952-4b0d-a5d0-1688b729e759.lovable.app-1785923040290.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>{themeScript}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            {/* Required: nested routes render here. */}
            <Outlet />
          </AuthGate>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <AppShell>
      <Bootstrap />
      {children}
    </AppShell>
  );
}

/** Creates the default account + categories the first time someone signs in. */
function Bootstrap() {
  const { data, isSuccess } = useAtlas();
  const bootstrap = useBootstrapWorkspace();

  useEffect(() => {
    if (!isSuccess) return;
    if (data.accounts.length === 0 && data.categories.length === 0 && bootstrap.isIdle) {
      bootstrap.mutate();
    }
  }, [isSuccess, data.accounts.length, data.categories.length, bootstrap]);

  return null;
}
