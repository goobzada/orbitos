import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ─── Stat card skeleton ─────────────────────────────────

export function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
            </CardContent>
        </Card>
    );
}

// ─── Table row skeleton ─────────────────────────────────

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
    return (
        <tr className="border-b border-border">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className={`h-4 ${i === 0 ? "w-36" : i === cols - 1 ? "w-16 ml-auto" : "w-24"}`} />
                </td>
            ))}
        </tr>
    );
}

// ─── Table skeleton ─────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} cols={cols} />
            ))}
        </>
    );
}

// ─── Page header skeleton ───────────────────────────────

export function PageHeaderSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>
    );
}

// ─── Chart skeleton ─────────────────────────────────────

export function ChartSkeleton({ height = 200 }: { height?: number }) {
    return (
        <div className={`w-full rounded-lg bg-muted/50 border border-dashed border-border flex items-end gap-1 px-4 pb-4 pt-8`} style={{ height }}>
            {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-muted animate-pulse" style={{ height: `${h}%` }} />
            ))}
        </div>
    );
}

// ─── Avatar + text skeleton ─────────────────────────────

export function AvatarTextSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}
