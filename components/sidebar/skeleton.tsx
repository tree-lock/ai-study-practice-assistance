import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="sticky top-0 h-screen w-[250px] min-w-[250px] bg-[#efeff1] px-2.5 py-3.5">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>
          <Skeleton className="size-7" />
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <div className="flex items-center gap-2 py-1.5 pl-3">
            <Skeleton className="size-[15px]" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2 py-1.5 pl-3">
            <Skeleton className="size-[15px]" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12 pl-3" />
          <div className="flex flex-col gap-1">
            <div className="py-1.5 pl-3">
              <Skeleton className="h-4 w-[120px]" />
            </div>
            <div className="py-1.5 pl-3">
              <Skeleton className="h-4 w-[90px]" />
            </div>
            <div className="py-1.5 pl-3">
              <Skeleton className="h-4 w-[140px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
