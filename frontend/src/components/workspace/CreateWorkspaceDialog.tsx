import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import useWorkspaceStore from "../../stores/workspace.store";

export default function CreateWorkspaceDialog() {
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Please enter a valid workspace name");
      return;
    }

    try {
      setIsSubmitting(true);

      await createWorkspace({ name: name.trim(), slug });

      toast.success("Workspace created successfully");
      setName("");
      setSlug("");
      setOpen(false);
    } catch {
      toast.error(
        "Failed to create workspace. Check whether the slug already exists.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" className="w-auto shrink-0 justify-start">
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your social media accounts and posts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace name</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Agency"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-agency"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique URL-friendly identifier for your workspace.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
