"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

// Simple Calendar wrapper compatible with shadcn usage
export function Calendar({ className, mode = "single", selected, onSelect, disabled, ...props }) {
  return (
    <div className={cn("rounded-md p-2", className)}>
      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

export default Calendar;
