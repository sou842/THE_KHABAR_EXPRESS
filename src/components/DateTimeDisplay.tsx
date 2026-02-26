import React from "react";

type DisplayType = "date" | "time" | "datetime" | "auto" | "auto-advanced";

interface DateTimeDisplayProps {
  children: string;
  type?: DisplayType;
  locale?: string;
  className?: string;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  children,
  type = "auto",
  locale = "en-US",
  className,
}) => {
  if (!children) return <span className={className}>Invalid Date</span>;

  const dateObj = new Date(children);
  if (isNaN(dateObj.getTime()))
    return <span className={className}>Invalid Date</span>;

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if ((type === "auto" || type === "auto-advanced") && diffHours < 24) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    const relative =
      diffMinutes < 1
        ? "Just now"
        : diffMinutes < 60
        ? `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`
        : `${Math.floor(diffHours)} hour${
            Math.floor(diffHours) > 1 ? "s" : ""
          } ago`;

    return <span className={className}>{relative}</span>;
  }

  const formatOptions: Intl.DateTimeFormatOptions = {};
  if (type === "date" || type === "datetime" || type === "auto" || type === "auto-advanced") {
    formatOptions.year = "numeric";
    formatOptions.month = "short";
    formatOptions.day = "2-digit";
  }

  if (type === "time" || type === "datetime" || type === "auto-advanced") {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    formatOptions.hour12 = true;
  }

  const formatted = new Intl.DateTimeFormat(locale, formatOptions).format(
    dateObj
  );

  return <span className={className}>{formatted}</span>;
};

export default DateTimeDisplay;
