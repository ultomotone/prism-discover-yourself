import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp } from "lucide-react";
import type { ReactNode } from "react";
import { useTypingLabLikes } from "../hooks/useTypingLabLikes";

interface LikeButtonProps {
  targetKey: string;
  label: string;
  children?: ReactNode;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export const LikeButton = ({
  targetKey,
  label,
  children = "Thumbs up",
  className,
  size = "sm",
  variant = "outline",
}: LikeButtonProps) => {
  const { like, getLikesFor, hasLiked } = useTypingLabLikes();
  const liked = hasLiked(targetKey);
  const count = getLikesFor(targetKey);

  const handleClick = () => {
    if (liked) {
      return;
    }
    like(targetKey);
  };

  return (
    <Button
      type="button"
      variant={liked ? "secondary" : variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleClick}
      disabled={liked}
      aria-pressed={liked}
      aria-label={label}
    >
      <ThumbsUp className="h-4 w-4" />
      <span className="text-sm font-medium">{liked ? "Thanks!" : children}</span>
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {count}
      </span>
    </Button>
  );
};
