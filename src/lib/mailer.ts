import nodemailer, { Transporter } from "nodemailer";

type SendMailArgs = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  const hasAuth = Boolean(user && pass);

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: hasAuth
      ? {
          user,
          pass,
        }
      : undefined,
  });

  return cachedTransporter;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  from,
}: SendMailArgs) {
  const transporter = getTransporter();

  const defaultFrom =
    from ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    "no-reply@khabar.local";

  return transporter.sendMail({
    from: defaultFrom,
    to,
    subject,
    text,
    html,
  });
}

export function buildTaskListCreatedEmail(taskList: any) {
  const createdAt = new Date(taskList.createdAt || Date.now());
  const category = taskList.category || "Unknown";
  const items: Array<any> = Array.isArray(taskList.data) ? taskList.data : [];
  const count = items.length;

  const subject = `Khabar Automation List ${new Date().toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  )}`;

  const itemLines = items
    ?.map((item: any, index: number) => {
      const idx = index + 1;
      const title = item?.title || "Untitled";
      const url = item?.url || "#";
      const published = item?.published ? "Yes" : "No";
      const source = item?.source || "-";
      return `${idx}. ${title} — Published: ${published} — ${source} — ${url}`;
    })
    ?.join("\n");

  const formatDate = (date: Date) => {
    const timeZone = process.env.MAIL_TZ || "Asia/Kolkata";
    try {
      return new Intl.DateTimeFormat("en-IN", {
        timeZone,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }).format(date);
    } catch {
      return date.toLocaleString("en-IN");
    }
  };

  const createdAtPretty = formatDate(createdAt);

  const text = `A new task list was created.\n\nCategory: ${category}\nCreated At: ${createdAtPretty}\nItems: ${count}\n\n${itemLines}`;

  const getDomain = (rawUrl: string): string => {
    try {
      const u = new URL(rawUrl);
      return (u.hostname || "").replace(/^www\./, "");
    } catch {
      return rawUrl || "";
    }
  };

  const rows = items
    .map((item: any, index: number) => {
      const idx = index + 1;
      const title = item?.title || "Untitled";
      const url = item?.url || "#";
      const source = item?.source || getDomain(url) || "-";
      const published = Boolean(item?.published);

      const badgeStyle = published
        ? "background:#16a34a;color:#fff;"
        : "background:#eab308;color:#111827;";

      const badgeText = published ? "Yes" : "No";

      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;width:40px;color:#6b7280;font:14px/20px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${idx}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;">
            <a href="${url}" style="color:#111827;text-decoration:none;font-weight:600;font:15px/22px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${title}</a>
            <div style="color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;word-break:break-all;">${url}</div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;white-space:nowrap;">
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;${badgeStyle}">${badgeText}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;color:#374151;font:14px/20px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${source}</td>
        </tr>
      `;
    })
    .join("");

  const createdAtLocal = createdAtPretty;

  const html = `
  <div style="margin:0;padding:0;background:#f5f7fb;">
    <div style="max-width:720px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;background:#0f172a;color:#fff;">
        <div style="font:700 20px/28px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">New Task List Created</div>
        <div style="margin-top:4px;font:400 13px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;opacity:0.85;">Khabar • Automated notification</div>
      </div>
      <div style="padding:20px 24px;">
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:16px;">
          <div style="font:14px/20px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#374151;margin-left: 8px"><strong>${category}</strong></div>
          <div style="font:14px/20px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#374151;margin-left: auto">${createdAtLocal}</div>
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #eef2f7;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th align="left" style="padding:10px 12px;color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-bottom:1px solid #eef2f7;width:40px;">#</th>
              <th align="left" style="padding:10px 12px;color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-bottom:1px solid #eef2f7;">Title</th>
              <th align="left" style="padding:10px 12px;color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-bottom:1px solid #eef2f7;white-space:nowrap;">Published</th>
              <th align="left" style="padding:10px 12px;color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-bottom:1px solid #eef2f7;">Source</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:16px;color:#6b7280;font:12px/18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">You are receiving this because a new task list was added in the admin. This is an automated message.</div>
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

export async function sendTaskListCreatedEmail(taskList: any) {
  const to = process.env.MAIL_TO || "saifactplanet@gmail.com";
  const { subject, text, html } = buildTaskListCreatedEmail(taskList);
  return sendMail({ to, subject, text, html });
}
