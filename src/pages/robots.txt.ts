import type { GetServerSideProps } from "next";

function buildRobotsTxt() {
  return [
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
