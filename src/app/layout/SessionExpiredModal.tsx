import React from "react"
import { useNavigate } from "react-router"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

export function SessionExpiredModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Session expired</DialogTitle>
          <DialogDescription>
            For your security, your session has timed out. Please sign in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => { onOpenChange(false); navigate("/login") }}>Sign in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
