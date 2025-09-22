"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

const Drawer = ({
  shouldScaleBackground = true,
  direction = "right",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    direction={direction}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Trigger
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
DrawerTrigger.displayName = "DrawerPrimitive.Trigger"

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Close
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
DrawerClose.displayName = "DrawerPrimitive.Close"

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = "DrawerPrimitive.Overlay"

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    direction?: "left" | "right" | "top" | "bottom"
  }
>(({ className, children, direction = "right", ...props }, ref) => {
  const getPositionClasses = () => {
    switch (direction) {
      case "bottom":
        return "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-background border-t shadow-lg transition-transform duration-300 ease-in-out"
      case "top":
        return "fixed top-0 left-0 right-0 z-50 max-h-[85vh] bg-background border-b shadow-lg transition-transform duration-300 ease-in-out"
      case "left":
        return "fixed left-0 top-0 z-50 h-full w-96 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out"
      case "right":
      default:
        return "fixed right-0 top-0 z-50 h-full w-96 bg-background border-l shadow-lg transition-transform duration-300 ease-in-out"
    }
  }

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(getPositionClasses(), className)}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerPrimitive.Content"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-3 p-6 pb-4 border-b",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 p-6 pt-4 border-t", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerPrimitive.Title"

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerPrimitive.Description"

export {
  Drawer, DrawerClose,
  DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger
}
