import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export function DeleteConfirmDialog({
  isOpen,
  symbol,
  isDeleting,
  onConfirm,
  onCancel,
  title,
  description,
}: {
  isOpen: boolean;
  symbol: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="size-4" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#c8ccd8]">
          {description}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500/90 hover:bg-red-600 text-white border-0"
          >
            {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}