"use client"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  // Standard shadcn takes `direction`. fluid's ResponsiveSplitLayout instead
  // passes `orientation` + `defaultLayout` + `onLayoutChanged` (its own naming),
  // so accept both: map `orientation`→`direction`, `onLayoutChanged`→`onLayout`,
  // and swallow `defaultLayout` (initial split comes from each Panel's
  // `defaultSize`). This keeps vanilla `direction` usage working too.
  direction,
  orientation,
  defaultLayout: _defaultLayout,
  onLayout,
  onLayoutChanged,
  ...props
}: Omit<PanelGroupProps, "direction"> & {
  direction?: PanelGroupProps["direction"]
  orientation?: "horizontal" | "vertical"
  defaultLayout?: number[]
  onLayoutChanged?: (layout: number[]) => void
}) {
  const resolvedDirection = direction ?? orientation ?? "horizontal"
  return (
    <PanelGroup
      data-slot="resizable-panel-group"
      direction={resolvedDirection}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      onLayout={onLayout ?? onLayoutChanged}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: PanelProps) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: PanelResizeHandleProps & {
  withHandle?: boolean
}) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring ring-offset-background relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-6 w-1 shrink-0 rounded-lg" />
      )}
    </PanelResizeHandle>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
