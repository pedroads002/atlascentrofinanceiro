import logo from "@/assets/atlas-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={logo.url}
        alt="Atlas Finance"
        className={cn("h-10 w-10 shrink-0 object-contain", showWordmark && "-ml-1")}
        style={{ objectPosition: "center" }}
      />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-foreground">Atlas</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Finance
          </span>
        </span>
      ) : null}
    </span>
  );
}