import type { GetServerSideProps } from "next";

function buildRobotsTxt() {
  return [
    "# All AI Search and Training Bots",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: anthropic-ai",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /write/",
    "Disallow: /admin/",
    "Disallow: /editor/",
    "Disallow: /admin/*",
    "Disallow: /editor/*",
    "",
    `Sitemap: https://thekhabarexpress.com/sitemap.xml`,
  ].join("\n");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(buildRobotsTxt());
  res.end();

  return {
    props: {},
  };
};

export default function RobotsTxt() {
  return null;
}
