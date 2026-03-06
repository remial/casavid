"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Switch } from "@/components/Switch";

export const SettingsModal = () => {
  const settings = useSettings();

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">
            My settings
          </h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>
              Settings
            </Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Change your Settings here
            </span>
            
          </div>
          <p className="pt-2"></p>
          <div className="pt-2 flex justify-end">
            <Switch />
            </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
};
