import { cn } from "@/src/lib/utils";

function Tooltip({
  label,
  children,
  show,
  arrowDirection = "right",
}: {
  label: string;
  children: React.ReactNode;
  show: boolean;
  arrowDirection?: "left" | "right" | "top" | "bottom";
}) {
  return (
    <div className="relative group/tooltip flex items-center">
      {children}
      {show && (
        <div
          className={cn(
            "absolute left-full ml-3 z-50 pointer-events-none",
            "px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
            "bg-[#1e2030] text-[#c8ccd8] border border-[#2a2d3e]",
            "shadow-xl opacity-0 translate-x-1 transition-all duration-150",
            "group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0",
          )}
        >
          {label}
          {/* Arrow */}
          <span
            className={cn(
              "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent",
              arrowDirection === "right" && "border-r-[#2a2d3e]",
              arrowDirection === "left" && "border-l-[#2a2d3e]",
              arrowDirection === "top" && "border-t-[#2a2d3e]",
              arrowDirection === "bottom" && "border-b-[#2a2d3e]",
            )}
          />
        </div>
      )}
    </div>
  );
}
export default Tooltip;
