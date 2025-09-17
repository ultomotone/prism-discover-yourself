import { useCallback, useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRedditAlien,
  FaSms,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { cn } from "@/lib/utils";

type ShareOption =
  | {
      key: string;
      label: string;
      icon: IconType;
      type: "link";
      getHref: (url: string, text: string) => string;
      target?: "_blank";
    }
  | {
      key: string;
      label: string;
      icon: IconType;
      type: "copy";
    };

const fallbackOrigin = "https://prismpersonality.com";

const baseButtonClasses =
  "group flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface TypingLabShareButtonsProps {
  path: string;
  title: string;
  message?: string;
  align?: "start" | "center";
  className?: string;
}

type CopyFeedbackState =
  | {
      status: "success" | "error";
      platform: string;
    }
  | null;

export const TypingLabShareButtons = ({
  path,
  title,
  message,
  align = "start",
  className,
}: TypingLabShareButtonsProps) => {
  const shareUrl = useMemo(() => {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : fallbackOrigin;

    try {
      return new URL(path, base).toString();
    } catch (error) {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `${base}${normalizedPath}`;
    }
  }, [path]);

  const shareMessage = message?.trim().length ? message : title;

  const [copyFeedback, setCopyFeedback] = useState<CopyFeedbackState>(null);

  useEffect(() => {
    setCopyFeedback(null);
  }, [shareMessage, shareUrl]);

  useEffect(() => {
    if (!copyFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopyFeedback(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copyFeedback]);

  const copyToClipboard = useCallback(async (content: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }

    if (typeof document === "undefined") {
      return false;
    }

    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    const selection = document.getSelection();
    const originalRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

    textArea.select();
    let success = false;

    try {
      success = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
    } catch (error) {
      success = false;
    }

    if (selection) {
      selection.removeAllRanges();
      if (originalRange) {
        selection.addRange(originalRange);
      }
    }

    document.body.removeChild(textArea);

    return success;
  }, []);

  const handleCopy = useCallback(
    async (platform: string) => {
      try {
        const success = await copyToClipboard(`${shareMessage}\n${shareUrl}`);
        if (!success) {
          setCopyFeedback({ status: "error", platform });
          return;
        }
        setCopyFeedback({ status: "success", platform });
      } catch (error) {
        setCopyFeedback({ status: "error", platform });
      }
    },
    [copyToClipboard, shareMessage, shareUrl]
  );

  const options: ShareOption[] = useMemo(
    () => [
      {
        key: "linkedin",
        label: "LinkedIn",
        icon: FaLinkedinIn,
        type: "link",
        getHref: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        target: "_blank",
      },
      {
        key: "facebook",
        label: "Facebook",
        icon: FaFacebookF,
        type: "link",
        getHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        target: "_blank",
      },
      {
        key: "reddit",
        label: "Reddit",
        icon: FaRedditAlien,
        type: "link",
        getHref: (url, text) =>
          `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
        target: "_blank",
      },
      {
        key: "instagram",
        label: "Instagram",
        icon: FaInstagram,
        type: "copy",
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        icon: FaWhatsapp,
        type: "link",
        getHref: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} – ${url}`)}`,
        target: "_blank",
      },
      {
        key: "email",
        label: "Email",
        icon: MdEmail,
        type: "link",
        getHref: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
      },
      {
        key: "tiktok",
        label: "TikTok",
        icon: FaTiktok,
        type: "copy",
      },
      {
        key: "sms",
        label: "SMS",
        icon: FaSms,
        type: "link",
        getHref: (url, text) => `sms:?&body=${encodeURIComponent(`${text} - ${url}`)}`,
      },
    ],
    []
  );

  const alignmentClasses = align === "center" ? "items-center text-center" : "items-start text-left";
  const iconRowAlignment = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={cn("flex flex-col gap-3", alignmentClasses, className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Share2 className="h-4 w-4" aria-hidden="true" />
        <span>Share</span>
      </div>
      <div className={cn("flex flex-wrap items-center gap-2", iconRowAlignment)}>
        {options.map((option) => {
          const Icon = option.icon;

          if (option.type === "link") {
            const href = option.getHref(shareUrl, shareMessage);
            const target = option.target;
            const rel = target === "_blank" ? "noopener noreferrer" : undefined;

            return (
              <a
                key={option.key}
                href={href}
                target={target}
                rel={rel}
                className={baseButtonClasses}
                aria-label={`Share on ${option.label}`}
                title={`Share on ${option.label}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Share on {option.label}</span>
              </a>
            );
          }

          return (
            <button
              key={option.key}
              type="button"
              className={baseButtonClasses}
              onClick={() => handleCopy(option.label)}
              aria-label={`Copy link for ${option.label}`}
              title={`Copy link for ${option.label}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Copy link for {option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="sr-only" aria-live="polite">
        {copyFeedback
          ? copyFeedback.status === "success"
            ? `Link copied for ${copyFeedback.platform}`
            : `Unable to copy link automatically for ${copyFeedback.platform}`
          : ""}
      </div>
      {copyFeedback && (
        <p
          className={cn(
            "text-xs",
            copyFeedback.status === "success" ? "text-muted-foreground" : "text-destructive"
          )}
        >
          {copyFeedback.status === "success"
            ? `Link copied for ${copyFeedback.platform}. Paste it into the app to share.`
            : "Unable to copy automatically. Please copy the link manually."}
        </p>
      )}
    </div>
  );
};
