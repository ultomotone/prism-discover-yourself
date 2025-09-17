import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Mail, MessageSquare } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingLabShareBarProps {
  title: string;
  canonicalPath?: string;
  alignment?: "start" | "center";
  className?: string;
}

interface ShareTarget {
  name: string;
  icon: ComponentType<LucideProps>;
  buildHref: () => string;
  openInNewTab?: boolean;
}

const WhatsappIcon = ({ className, ...props }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className={cn(className)}
    {...props}
  >
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"
    />
  </svg>
);

const TikTokIcon = ({ className, ...props }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className={cn(className)}
    {...props}
  >
    <path
      fill="currentColor"
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
    />
  </svg>
);

const RedditIcon = ({ className, ...props }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className={cn(className)}
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.812 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"
    />
  </svg>
);

const fallbackOrigin = "https://prismpersonality.com";

export const TypingLabShareBar = ({
  title,
  canonicalPath,
  alignment = "center",
  className,
}: TypingLabShareBarProps) => {
  const [shareUrl, setShareUrl] = useState<string>(() => {
    if (typeof window !== "undefined" && !canonicalPath) {
      return window.location.href;
    }
    if (typeof window !== "undefined" && canonicalPath) {
      return `${window.location.origin}${canonicalPath}`;
    }
    return `${fallbackOrigin}${canonicalPath ?? ""}`;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const resolved = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : window.location.href;
    setShareUrl(resolved);
  }, [canonicalPath]);

  const targets = useMemo<ShareTarget[]>(() => {
    if (!shareUrl) {
      return [];
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedMessage = encodeURIComponent(`${title} ${shareUrl}`.trim());

    return [
      {
        name: "LinkedIn",
        icon: Linkedin,
        buildHref: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        openInNewTab: true,
      },
      {
        name: "Facebook",
        icon: Facebook,
        buildHref: () => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        openInNewTab: true,
      },
      {
        name: "Instagram",
        icon: Instagram,
        buildHref: () => `https://www.instagram.com/?url=${encodedUrl}`,
        openInNewTab: true,
      },
      {
        name: "WhatsApp",
        icon: WhatsappIcon,
        buildHref: () => `https://wa.me/?text=${encodedMessage}`,
        openInNewTab: true,
      },
      {
        name: "Email",
        icon: Mail,
        buildHref: () => `mailto:?subject=${encodedTitle}&body=${encodedMessage}`,
      },
      {
        name: "TikTok",
        icon: TikTokIcon,
        buildHref: () => `https://www.tiktok.com/share?url=${encodedUrl}`,
        openInNewTab: true,
      },
      {
        name: "SMS",
        icon: MessageSquare,
        buildHref: () => `sms:?body=${encodedMessage}`,
      },
      {
        name: "Reddit",
        icon: RedditIcon,
        buildHref: () => `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        openInNewTab: true,
      },
    ];
  }, [shareUrl, title]);

  const alignmentClasses = alignment === "start" ? "items-start" : "items-center";
  const justifyClasses = alignment === "start" ? "justify-start" : "justify-center";

  return (
    <div className={cn("flex flex-col gap-2", alignmentClasses, className)}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Share</span>
      <div className={cn("flex flex-wrap gap-2", justifyClasses)}>
        {targets.map((target) => {
          const href = target.buildHref();
          const targetProps = target.openInNewTab
            ? { target: "_blank", rel: "noreferrer" }
            : {};

          return (
            <Button
              key={target.name}
              variant="outline"
              size="icon"
              asChild
              className="h-10 w-10"
            >
              <a
                href={href}
                aria-label={`Share on ${target.name}`}
                title={`Share on ${target.name}`}
                {...targetProps}
              >
                <target.icon className="h-4 w-4" />
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
