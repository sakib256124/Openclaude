import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function DestructiveConfirmationDialog(props: Omit<React.ComponentProps<typeof ConfirmationDialog>, "destructive">) {
  return <ConfirmationDialog {...props} destructive />;
}
