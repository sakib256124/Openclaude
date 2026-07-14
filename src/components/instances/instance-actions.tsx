import { Camera, Play, Power, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstanceActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" disabled><Play />Start</Button>
      <Button variant="secondary" disabled><Power />Stop</Button>
      <Button variant="secondary" disabled><RotateCw />Reboot</Button>
      <Button variant="secondary" disabled><Camera />Snapshot</Button>
      <Button variant="destructive" disabled><Trash2 />Delete</Button>
    </div>
  );
}
