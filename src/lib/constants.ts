import { Facebook, Instagram, Twitter, Send, LucideIcon } from "lucide-react";

export interface SocialLinkItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLinkItem[] = [
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61582733362555" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/the_khabar_express?igsh=a2V5eWYxazJmMWl6" },
  { icon: Twitter, label: "Twitter", href: "https://x.com/khabar_express_" },
  { icon: Send, label: "Telegram", href: "https://t.me/the_khabar_express_news" },
];
