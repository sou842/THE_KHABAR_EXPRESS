import jsPDF from "jspdf";
import { toast } from "sonner";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND   = [15,  23,  42]  as const;
const ACCENT  = [37,  99,  235] as const;
const MUTED   = [100, 116, 139] as const;
const BODY    = [30,  41,  59]  as const;
const RULE    = [226, 232, 240] as const;
const SURFACE = [248, 250, 252] as const;
const SUCCESS = [22,  163, 74]  as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
const MARGIN    = 18;
const HEADER_H  = 16;
const FOOTER_H  = 14;
const LINE_SM   =  5.5;
const LINE_MD   =  6.2;
const LINE_LG   =  7.5;
const BLOCK_GAP =  5;
const INDENT    =  6;

export const generateBlogPdf = async (blog: any) => {
  const toastId = toast.loading("Generating PDF…");

  try {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4", putOnlyUsedFonts: true });

    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const CW = PW - MARGIN * 2;
    let y = MARGIN + HEADER_H;

    // ── Helpers ──────────────────────────────────────────────────────────────

    const rgb = (c: readonly [number, number, number]) => c as [number, number, number];

    const cleanText = (val: unknown): string =>
      String(val ?? "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();

    const set = (
      font: "normal" | "bold" | "italic",
      size: number,
      color: readonly [number, number, number] = BODY
    ) => {
      doc.setFont("helvetica", font);
      doc.setFontSize(size);
      doc.setTextColor(...rgb(color));
    };

    const checkBreak = (needed: number) => {
      if (y + needed > PH - FOOTER_H - MARGIN) {
        doc.addPage();
        y = MARGIN + HEADER_H;
      }
    };

    const hRule = (color: readonly [number, number, number] = RULE, w = 0.3) => {
      doc.setDrawColor(...rgb(color));
      doc.setLineWidth(w);
      doc.line(MARGIN, y, PW - MARGIN, y);
    };

    // ── Per-page decorations ──────────────────────────────────────────────────

    const decoratePage = (pageNum: number, total: number) => {
      // Header bar
      doc.setFillColor(...rgb(BRAND));
      doc.rect(0, 0, PW, HEADER_H - 2, "F");

      // Publication name — left (with clickable link)
      set("bold", 9, [255, 255, 255] as const);
      doc.textWithLink("THE KHABAR EXPRESS", MARGIN, HEADER_H - 6, {
        url: "https://www.thekhabarexpress.com/",
      });

      // URL — right (also clickable)
      set("normal", 7, [148, 163, 184] as const);
      doc.textWithLink("thekhabarexpress.com", PW - MARGIN, HEADER_H - 6, {
        align: "right",
        url: "https://www.thekhabarexpress.com/",
      });

      // Footer rule
      doc.setDrawColor(...rgb(RULE));
      doc.setLineWidth(0.3);
      doc.line(MARGIN, PH - FOOTER_H + 3, PW - MARGIN, PH - FOOTER_H + 3);

      // Page number — centre
      set("normal", 8, MUTED);
      doc.text(`${pageNum} / ${total}`, PW / 2, PH - FOOTER_H + 8, { align: "center" });

      // Footer brand — left
      set("normal", 7, MUTED);
      doc.text("The Khabar Express", MARGIN, PH - FOOTER_H + 8);
    };

    // ── Title block ───────────────────────────────────────────────────────────

    const title = cleanText(blog?.title) || "Untitled Article";

    if (blog?.category) {
      set("bold", 7, ACCENT);
      doc.text(String(blog.category).toUpperCase(), MARGIN, y);
      y += 9;
    }

    // IMPORTANT: set font BEFORE splitTextToSize so jsPDF measures correctly
    set("bold", 26, BRAND);
    const titleLines = doc.splitTextToSize(title, CW);
    titleLines.forEach((line: string) => {
      checkBreak(13);
      doc.text(line, MARGIN, y);
      y += 13;
    });

    y += 2;
    doc.setDrawColor(...rgb(ACCENT));
    doc.setLineWidth(1.2);
    doc.line(MARGIN, y, MARGIN + 28, y);
    doc.setLineWidth(0.3);
    doc.line(MARGIN + 30, y, PW - MARGIN, y);
    y += 7;

    const datePart  = blog?.createdAt
      ? new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "";
    const authorPart = blog?.author ? `By ${blog.author}` : "";
    const metaLine   = [datePart, authorPart].filter(Boolean).join("  ·  ");

    if (metaLine) {
      set("normal", 9, MUTED);
      doc.text(metaLine, MARGIN, y);
      y += LINE_SM + 2;
    }

    hRule();
    y += 8;

    // ── Body blocks ───────────────────────────────────────────────────────────

    doc.setTextColor(...rgb(BODY));
    const blocks = Array.isArray(blog?.body) ? blog.body : [];

    blocks.forEach((block: any) => {
      const type = block?.type;
      const data = block?.data;
      if (!type || !data) return;

      // ── Header ──
      if (type === "header") {
        const levelMap: Record<number, { size: number; weight: "bold" | "normal"; gap: number }> = {
          1: { size: 20, weight: "bold",   gap: 4 },
          2: { size: 17, weight: "bold",   gap: 3 },
          3: { size: 14, weight: "bold",   gap: 3 },
          4: { size: 12, weight: "bold",   gap: 2 },
          5: { size: 11, weight: "bold",   gap: 2 },
          6: { size: 10, weight: "normal", gap: 2 },
        };
        const cfg = levelMap[data.level as number] ?? levelMap[3];
        const lh  = cfg.size * 0.42;
        const text = cleanText(data.text);

        // ✅ Set font FIRST so splitTextToSize measures with the correct font
        set(cfg.weight, cfg.size, BRAND);
        const lines = doc.splitTextToSize(text, CW);

        checkBreak(lines.length * (lh + 1) + cfg.gap + 10);
        lines.forEach((line: string) => {
          doc.text(line, MARGIN, y);
          y += lh + 1;
        });

        if ((data.level ?? 3) <= 2) {
          y += 1;
          hRule(RULE, 0.4);
          y += 2;
        }
        y += cfg.gap + BLOCK_GAP;
        doc.setTextColor(...rgb(BODY));

      // ── Paragraph ──
      } else if (type === "paragraph") {
        const text = cleanText(data.text);
        if (!text) return;
        set("normal", 11, BODY);
        const lines = doc.splitTextToSize(text, CW);
        checkBreak(lines.length * LINE_MD + BLOCK_GAP);
        lines.forEach((line: string) => { doc.text(line, MARGIN, y); y += LINE_MD; });
        y += BLOCK_GAP;

      // ── List ──
      } else if (type === "list") {
        set("normal", 11, BODY);
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: any, idx: number) => {
          const raw   = typeof item === "string" ? item : String(item?.content ?? item?.text ?? "");
          const clean = cleanText(raw);
          if (!clean) return;
          const bullet = data.style === "ordered" ? `${idx + 1}.` : "•";
          const lines  = doc.splitTextToSize(clean, CW - INDENT - 4);
          checkBreak(lines.length * LINE_MD + 2);

          set("bold", 11, ACCENT);
          doc.text(bullet, MARGIN + INDENT - 4, y);

          set("normal", 11, BODY);
          lines.forEach((line: string, li: number) => {
            doc.text(line, MARGIN + INDENT + 1, li === 0 ? y : y + li * LINE_MD);
          });
          y += lines.length * LINE_MD + 1;
        });
        y += BLOCK_GAP;

      // ── Checklist ──
      } else if (type === "checklist") {
        set("normal", 11, BODY);
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: any) => {
          const checked = !!item?.checked;
          const text    = cleanText(item?.text);
          if (!text) return;
          const lines = doc.splitTextToSize(text, CW - INDENT - 4);
          checkBreak(lines.length * LINE_MD + 2);

          doc.setDrawColor(...rgb(checked ? ACCENT : MUTED));
          doc.setFillColor(...rgb(checked ? ACCENT : [255, 255, 255] as const));
          doc.setLineWidth(0.5);
          doc.roundedRect(MARGIN + INDENT - 5, y - 3.5, 4, 4, 0.8, 0.8, checked ? "FD" : "D");

          if (checked) {
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.6);
            doc.line(MARGIN + INDENT - 4.2, y - 1.5, MARGIN + INDENT - 3.2, y - 0.5);
            doc.line(MARGIN + INDENT - 3.2, y - 0.5, MARGIN + INDENT - 1.6, y - 3);
          }

          set("normal", 11, checked ? SUCCESS : BODY);
          lines.forEach((line: string, li: number) => {
            doc.text(line, MARGIN + INDENT + 1, li === 0 ? y : y + li * LINE_MD);
          });
          y += lines.length * LINE_MD + 1;
        });
        y += BLOCK_GAP;

      // ── Table ──
      } else if (type === "table") {
        const rows = Array.isArray(data.content) ? data.content : [];
        if (rows.length === 0) return;

        const colCount = Math.max(...rows.map((r: unknown[]) => (Array.isArray(r) ? r.length : 0)));
        if (colCount === 0) return;
        const colW = CW / colCount;

        rows.forEach((row: unknown[], rowIdx: number) => {
          if (!Array.isArray(row) || row.length === 0) return;
          const isHeader = data.withHeadings && rowIdx === 0;

          set(isHeader ? "bold" : "normal", 10, isHeader ? ([255, 255, 255] as const) : BODY);
          const rowData = row.map((cell) => doc.splitTextToSize(cleanText(cell), colW - 5));
          const rowH    = Math.max(...rowData.map((l: string[]) => l.length * 5 + 5), 8);

          checkBreak(rowH);

          if (isHeader) {
            doc.setFillColor(...rgb(BRAND));
          } else {
            doc.setFillColor(...rgb(rowIdx % 2 === 0 ? SURFACE : ([255, 255, 255] as const)));
          }
          doc.rect(MARGIN, y - 1, CW, rowH, "F");

          doc.setDrawColor(...rgb(RULE));
          doc.setLineWidth(0.25);
          rowData.forEach((_: any, ci: number) => {
            doc.rect(MARGIN + ci * colW, y - 1, colW, rowH);
          });

          rowData.forEach((lines: string[], ci: number) => {
            set(isHeader ? "bold" : "normal", 10, isHeader ? ([255, 255, 255] as const) : BODY);
            lines.forEach((line: string, li: number) => {
              doc.text(line, MARGIN + ci * colW + 2.5, y + 3 + li * 5);
            });
          });

          y += rowH;
        });
        y += BLOCK_GAP + 3;
        doc.setTextColor(...rgb(BODY));

      // ── Warning ──
      } else if (type === "warning") {
        const wTitle = cleanText(data.title) || "Note";
        const wMsg   = cleanText(data.message);
        set("bold", 10, ACCENT);
        const tLines = doc.splitTextToSize(`⚠  ${wTitle}`, CW - 10);
        set("normal", 10, BODY);
        const mLines = wMsg ? doc.splitTextToSize(wMsg, CW - 10) : [];
        const boxH   = (tLines.length + mLines.length) * LINE_SM + 10;

        checkBreak(boxH);

        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(...rgb(ACCENT));
        doc.setLineWidth(0.25);
        doc.roundedRect(MARGIN, y - 1, CW, boxH, 1.5, 1.5, "FD");

        doc.setFillColor(...rgb(ACCENT));
        doc.roundedRect(MARGIN, y - 1, 2.5, boxH, 1, 1, "F");

        let ty = y + 5;
        set("bold", 10, ACCENT);
        tLines.forEach((l: string) => { doc.text(l, MARGIN + 6, ty); ty += LINE_SM; });
        if (mLines.length) {
          set("normal", 10, BODY);
          mLines.forEach((l: string) => { doc.text(l, MARGIN + 6, ty); ty += LINE_SM; });
        }
        y += boxH + BLOCK_GAP + 2;
        doc.setTextColor(...rgb(BODY));

      // ── Quote ──
      } else if (type === "quote") {
        const text  = cleanText(data.text);
        set("italic", 11.5, [51, 65, 85] as const);
        const lines = doc.splitTextToSize(text, CW - 14);
        const boxH  = lines.length * LINE_LG + 8;
        checkBreak(boxH);

        doc.setFillColor(...rgb(SURFACE));
        doc.setDrawColor(...rgb(RULE));
        doc.setLineWidth(0.25);
        doc.roundedRect(MARGIN, y - 2, CW, boxH, 1.5, 1.5, "FD");

        doc.setFillColor(...rgb(ACCENT));
        doc.roundedRect(MARGIN, y - 2, 3, boxH, 1, 1, "F");

        lines.forEach((line: string) => {
          doc.text(line, MARGIN + 9, y + 2);
          y += LINE_LG;
        });

        if (data.caption) {
          y += 1;
          set("normal", 9, MUTED);
          doc.text(`— ${cleanText(data.caption)}`, MARGIN + 9, y);
          y += LINE_SM;
        }
        y += BLOCK_GAP + 4;
        doc.setTextColor(...rgb(BODY));

      // ── Delimiter ──
      } else if (type === "delimiter") {
        checkBreak(14);
        const cx = PW / 2;
        doc.setFillColor(...rgb(MUTED));
        [-8, 0, 8].forEach((offset) => {
          doc.circle(cx + offset, y + 5, 0.9, "F");
        });
        y += 14;
      }
    });

    // ── Apply per-page decorations ────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      decoratePage(i, pageCount);
    }

    const filename = (blog?.title?.trim() || "document").replace(/\s+/g, "_");
    doc.save(`${filename}.pdf`);
    toast.dismiss(toastId);
    toast.success("PDF generated successfully!");

  } catch (err) {
    console.error("PDF generation error:", err);
    toast.dismiss(toastId);
    toast.error("Failed to generate PDF.");
    throw err;
  }
};