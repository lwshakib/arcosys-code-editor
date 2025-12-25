"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Day {
  contributionCount: number;
  date: string;
  color: string;
}

interface Week {
  contributionDays: Day[];
}

interface ContributionActivityProps {
  calendar: Week[];
  totalContributions: number;
}

export function ContributionActivity({
  calendar,
  totalContributions,
}: ContributionActivityProps) {
  // Flatten days and group them by month for labels
  const allDays = calendar.flatMap((w) => w.contributionDays);

  // Get month labels
  const monthLabels: { label: string; index: number }[] = [];
  calendar.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const date = parseISO(firstDay.date);
      const monthLabel = format(date, "MMM");
      if (
        monthLabels.length === 0 ||
        monthLabels[monthLabels.length - 1].label !== monthLabel
      ) {
        monthLabels.push({ label: monthLabel, index: i });
      }
    }
  });

  const lastDay = allDays[allDays.length - 1];
  const displayYear = lastDay
    ? format(parseISO(lastDay.date), "yyyy")
    : format(new Date(), "yyyy");

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card className="mx-4 lg:mx-6 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Contribution Activity
          </CardTitle>
          <CardDescription>
            Visualizing your coding frequency over the last year
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{totalContributions}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            contributions in the last year
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center w-full overflow-hidden">
          <div className="inline-flex flex-col gap-2 max-w-full overflow-x-auto pb-2 scrollbar-hide">
            {/* Month labels */}
            <div className="relative text-[10px] text-muted-foreground ml-8 h-4 mb-1">
              {monthLabels.map((m, i) => (
                <div
                  key={`${m.label}-${i}`}
                  style={{
                    position: "absolute",
                    left: `${m.index * 13.5}px`,
                  }}
                  className="whitespace-nowrap translate-y-[2px]"
                >
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Day labels */}
              <div className="flex flex-col gap-[3.5px] text-[10px] text-muted-foreground w-6 pt-1">
                {dayLabels.map((label, i) => (
                  <div key={i} className="h-[11px] flex items-center">
                    {label}
                  </div>
                ))}
              </div>

              {/* The Grid */}
              <div className="flex gap-[3.5px]">
                <TooltipProvider delayDuration={100}>
                  {calendar.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3.5px]">
                      {week.contributionDays.map((day, dayIndex) => (
                        <Tooltip key={day.date}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: (weekIndex * 7 + dayIndex) * 0.001,
                              }}
                              className="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
                              style={{
                                backgroundColor:
                                  day.contributionCount === 0
                                    ? "rgb(24, 29, 39)"
                                    : day.color,
                                opacity: day.contributionCount === 0 ? 0.3 : 1,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <span className="font-bold">
                              {day.contributionCount} contributions
                            </span>{" "}
                            on {format(parseISO(day.date), "MMMM d, yyyy")}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <div>
            {totalContributions} activities in {displayYear}
          </div>
          <div className="flex items-center gap-0.75">
            <span>Less</span>
            <div className="flex gap-0.75">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{
                    backgroundColor:
                      i === 0 ? "rgb(24, 29, 39)" : "var(--primary)",
                    opacity: i === 0 ? 0.3 : i * 0.25,
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContributionActivitySkeleton() {
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card className="mx-4 lg:mx-6 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-12 ml-auto" />
          <Skeleton className="h-3 w-32 ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center w-full overflow-hidden">
          <div className="inline-flex flex-col gap-2">
            {/* Month labels placeholder */}
            <div className="flex gap-10 ml-8 h-4 mb-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>

            <div className="flex gap-2">
              {/* Day labels */}
              <div className="flex flex-col gap-[3.5px] w-6 pt-1">
                {dayLabels.map((_, i) => (
                  <div key={i} className="h-[11px] flex items-center">
                    <Skeleton className="h-2 w-4" />
                  </div>
                ))}
              </div>

              {/* The Grid placeholder */}
              <div className="flex gap-[3.5px]">
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3.5px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <Skeleton
                        key={dayIndex}
                        className="w-[11px] h-[11px] rounded-[2px] opacity-20"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/10">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-2.5 h-2.5 rounded-[2px]" />
              ))}
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
