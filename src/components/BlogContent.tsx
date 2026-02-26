import { FC, Fragment, Suspense } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import dynamic from "next/dynamic";
// import "./style.scss";

const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-gray-200 animate-pulse flex items-center justify-center">
      Loading...
    </div>
  ),
});

export const BlogContent: FC<{ block: any }> = ({ block }) => {
  if (!block || typeof block !== "object") {
    return null;
  }

  const safelyAccessData = (obj: any, path: string, fallback: any = null) => {
    try {
      return (
        path
          .split(".")
          .reduce(
            (acc, key) => (acc && acc?.[key] !== undefined ? acc?.[key] : null),
            obj
          ) || fallback
      );
    } catch (e) {
      return fallback;
    }
  };

  const ImageSizeFormatHandler = (props: any = {}) => {
    const {
      withBorder = false,
      withBackground = false,
      stretched = false,
    } = props;

    const format = `${withBackground ? "bg-[#cecece]" : ""} ${
      stretched ? "w-full h-full" : "w-full h-full"
    } ${withBorder ? "p-1 border border-black-50 rounded" : ""}`;
    return format;
  };

  const renderHeading = (level: number = 2, text: string = "") => {
    const validLevel = !isNaN(Number(level))
      ? Math.max(1, Math.min(6, Number(level)))
      : 2;

    const headingId = `heading-${safelyAccessData(block, "id", "")}`
      .replace(/\s+/g, "-")
      .toLowerCase();

    const safeText = typeof text === "string" ? text : "";

    switch (validLevel) {
      case 1:
        return (
          <h1
            id={headingId || undefined}
            className="w-full font-semibold text-4xl leading-[110%] text-black-700"
            dangerouslySetInnerHTML={{ __html: safeText }}
          />
        );
      case 2:
        return (
          <h2
            id={headingId || undefined}
            className="w-full font-semibold text-3xl leading-[110%] text-black-700"
            dangerouslySetInnerHTML={{ __html: safeText }}
          />
        );
      case 3:
        return (
          <h3
            id={headingId || undefined}
            className="w-full font-semibold text-2xl leading-[110%] text-black-700"
            dangerouslySetInnerHTML={{ __html: safeText }}
          />
        );
      case 4:
        return (
          <h4
            id={headingId || undefined}
            className="w-full font-semibold text-xl leading-[110%] text-black-700"
            dangerouslySetInnerHTML={{ __html: safeText }}
          />
        );
      default:
        return (
          <h2
            id={headingId || undefined}
            className="w-full font-semibold text-3xl leading-[110%] md:text-[46px] text-black-700"
            dangerouslySetInnerHTML={{ __html: safeText }}
          />
        );
    }
  };

  try {
    return (
      <Fragment>
        {(() => {
          const blockType = safelyAccessData(block, "type", "");

          switch (blockType) {
            case "header":
              return renderHeading(
                safelyAccessData(block, "data.level", 2),
                safelyAccessData(block, "data.text", "")
              );
            case "paragraph":
              return (
                <p
                  className="w-full md:text-base text-sm tracking-[0.3px] leading-[26px] font-normal text-black-500"
                  dangerouslySetInnerHTML={{
                    __html: safelyAccessData(block, "data.text", ""),
                  }}
                  itemProp="articleBody"
                />
              );
            case "image":
              const imageUrl = safelyAccessData(block, "data.file.url", "");
              if (!imageUrl) {
                return null;
              }

              return (
                <figure
                  className={`w-full h-auto flex flex-col gap-2 items-center ${ImageSizeFormatHandler(
                    {
                      withBorder: safelyAccessData(
                        block,
                        "data.withBorder",
                        false
                      ),
                      withBackground: safelyAccessData(
                        block,
                        "data.withBackground",
                        false
                      ),
                      stretched: safelyAccessData(
                        block,
                        "data.stretched",
                        false
                      ),
                    }
                  )}`}
                  itemProp="image"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                >
                  <img
                    className="w-full rounded"
                    loading="lazy"
                    src={imageUrl}
                    alt={safelyAccessData(block, "data.caption", "Image")}
                    itemProp="contentUrl"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=600";
                    }}
                  />
                  {safelyAccessData(block, "data.caption") && (
                    <figcaption
                      className="text-sm md:text-base font-semibold text-black-500"
                      dangerouslySetInnerHTML={{
                        __html: safelyAccessData(block, "data.caption", ""),
                      }}
                      itemProp="caption"
                    />
                  )}
                  <meta itemProp="representativeOfPage" content="true" />
                </figure>
              );
            case "inlineImage":
              const inlineImageUrl = safelyAccessData(block, "data.url", "");
              if (!inlineImageUrl) {
                return null;
              }

              return (
                <figure
                  className={`w-full h-auto flex flex-col gap-2 items-center ${ImageSizeFormatHandler(
                    {
                      withBorder: safelyAccessData(
                        block,
                        "data.withBorder",
                        false
                      ),
                      withBackground: safelyAccessData(
                        block,
                        "data.withBackground",
                        false
                      ),
                      stretched: safelyAccessData(
                        block,
                        "data.stretched",
                        false
                      ),
                    }
                  )}`}
                  itemProp="image"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                >
                  <img
                    className="w-full rounded"
                    loading="lazy"
                    src={inlineImageUrl}
                    alt={safelyAccessData(block, "data.caption", "Image")}
                    itemProp="contentUrl"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=600";
                    }}
                  />
                  {safelyAccessData(block, "data.caption") && (
                    <figcaption
                      className="text-sm md:text-base font-semibold text-black-500"
                      dangerouslySetInnerHTML={{
                        __html: safelyAccessData(block, "data.caption", ""),
                      }}
                      itemProp="caption"
                    />
                  )}
                </figure>
              );
            case "youtubeEmbed":
              const youtubeUrl = safelyAccessData(block, "data.url", "");
              if (!youtubeUrl) {
                return null;
              }

              let videoId = "";
              try {
                const url = new URL(youtubeUrl);
                videoId = url.searchParams.get("v") || "";
              } catch (e) {
                // Invalid URL, but we'll continue without the thumbnail
              }

              return (
                <div
                  className="w-full flex flex-col gap-2"
                  itemProp="video"
                  itemScope
                  itemType="https://schema.org/VideoObject"
                >
                  <meta itemProp="embedUrl" content={youtubeUrl} />
                  {videoId && (
                    <meta
                      itemProp="thumbnailUrl"
                      content={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    />
                  )}
                  <div className="w-full aspect-video">
                    <ReactPlayer
                      width="100%"
                      height="100%"
                      url={youtubeUrl}
                      controls={true}
                      aria-label="YouTube video"
                      onError={() => {
                        // Silent error handling
                      }}
                    />
                  </div>
                </div>
              );
            case "list":
              const listItems = safelyAccessData(block, "data.items", []);
              if (!Array.isArray(listItems) || listItems.length === 0) {
                return null;
              }

              const listStyle = safelyAccessData(
                block,
                "data.style",
                "unordered"
              );

              return listStyle === "ordered" ? (
                <ol className="w-full flex flex-col gap-2 ml-6">
                  {listItems?.map((item: any, index: number) => (
                    <li
                      key={index}
                      className="w-full flex flex-row items-start gap-3"
                    >
                      <div
                        className="mt-[6px] text-black-500 contact_list"
                        dangerouslySetInnerHTML={{
                          __html: safelyAccessData(item, "content", ""),
                        }}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="w-full flex flex-col gap-2 ml-6">
                  {listItems?.map((item: any, index: number) => (
                    <li
                      key={index}
                      className="w-full flex flex-row items-start gap-3"
                    >
                      <span
                        className="text-2xl font-semibold flex flex-row items-center text-black-700"
                        aria-hidden="true"
                      >
                        •
                      </span>
                      <div
                        className="mt-[6px] text-black-500 contact_list"
                        dangerouslySetInnerHTML={{
                          __html: safelyAccessData(item, "content", ""),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              );
            case "code":
              return (
                <div
                  className="w-full text-sm md:text-base"
                  role="region"
                  aria-label="Code block"
                >
                  <CopyBlock
                    text={safelyAccessData(
                      block,
                      "data.code",
                      "// No code provided"
                    )}
                    language={safelyAccessData(block, "data.language", "jsx")}
                    showLineNumbers={false}
                    codeBlock={true}
                    theme={dracula}
                  />
                </div>
              );
            case "raw":
              return (
                <div
                  className="w-full text-sm md:text-base"
                  role="region"
                  aria-label="HTML code block"
                >
                  <CopyBlock
                    text={safelyAccessData(
                      block,
                      "data.html",
                      "<!-- No HTML provided -->"
                    )}
                    language={"html"}
                    showLineNumbers={false}
                    codeBlock={true}
                    theme={dracula}
                  />
                </div>
              );
            case "quote":
              return (
                <blockquote
                  className="w-full flex flex-col gap-2"
                  itemProp="citation"
                >
                  <p
                    className="text-xs md:text-base font-normal px-4 py-3 text-black-700 bg-[#d3d3d32f] border-l-[4px] border-[#ccc]"
                    dangerouslySetInnerHTML={{
                      __html: safelyAccessData(block, "data.text", ""),
                    }}
                  />
                  {safelyAccessData(block, "data.caption") && (
                    <footer
                      className="border rounded px-4 py-3 text-xs md:text-base font-normal text-black-500"
                      dangerouslySetInnerHTML={{
                        __html: safelyAccessData(block, "data.caption", ""),
                      }}
                    />
                  )}
                </blockquote>
              );
            case "delimiter":
              return (
                <hr
                  className="w-full border-t border-gray-300 my-5"
                  aria-hidden="true"
                />
              );
            case "warning":
              const hasTitle = !!safelyAccessData(block, "data.title");
              const hasMessage = !!safelyAccessData(block, "data.message");

              if (!hasTitle && !hasMessage) {
                return null;
              }

              return (
                <aside
                  className="w-full flex flex-col gap-2"
                  role="note"
                  aria-label="Warning"
                >
                  {hasTitle && (
                    <h4
                      className="text-xs md:text-base font-normal px-4 py-3 text-black-700 bg-[#ffa7a717] border-l-[4px] border-[#ff8282]"
                      dangerouslySetInnerHTML={{
                        __html: safelyAccessData(block, "data.title", ""),
                      }}
                    />
                  )}
                  {hasMessage && (
                    <p
                      className="text-xs md:text-base font-normal px-4 py-3 text-black-500 bg-[#ffa7a717]"
                      dangerouslySetInnerHTML={{
                        __html: safelyAccessData(block, "data.message", ""),
                      }}
                    />
                  )}
                </aside>
              );
            case "checklist":
              const checklistItems = safelyAccessData(block, "data.items", []);
              if (
                !Array.isArray(checklistItems) ||
                checklistItems.length === 0
              ) {
                return null;
              }

              return (
                <ul
                  className="w-full px-4 py-1"
                  role="group"
                  aria-label="Checklist"
                >
                  {checklistItems.map((item: any, index: number) => (
                    <li
                      className="w-full flex flex-row gap-4 items-center"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        checked={!!safelyAccessData(item, "checked", false)}
                        readOnly
                        aria-checked={
                          !!safelyAccessData(item, "checked", false)
                        }
                        aria-label={safelyAccessData(
                          item,
                          "text",
                          "Checklist item"
                        )}
                      />
                      <span className="text-xs md:text-sm leading-5 font-normal text-black-500">
                        {safelyAccessData(item, "text", "")}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            case "table":
              const tableContent = safelyAccessData(block, "data.content", []);
              if (!Array.isArray(tableContent) || tableContent.length === 0) {
                return null;
              }

              const validTable = tableContent.every((row) =>
                Array.isArray(row)
              );
              if (!validTable) {
                return null;
              }

              const withHeadings = !!safelyAccessData(
                block,
                "data.withHeadings",
                false
              );

              return (
                <div
                  className="w-full overflow-x-auto"
                  role="region"
                  aria-label="Table"
                >
                  <table className="w-full border" role="grid">
                    {withHeadings && tableContent.length > 0 && (
                      <thead className="border">
                        <tr className="border">
                          {tableContent[0].map(
                            (cell: any, cellIndex: number) => (
                              <th
                                key={cellIndex}
                                dangerouslySetInnerHTML={{ __html: cell || "" }}
                                className="border text-start px-3 py-[6px] overflow-hidden text-[#252525]"
                                scope="col"
                              />
                            )
                          )}
                        </tr>
                      </thead>
                    )}
                    <tbody className="border">
                      {tableContent?.map((row: any[], rowIndex: number) => {
                        if (rowIndex === 0 && withHeadings) {
                          return null;
                        } else {
                          return (
                            <tr className="border" key={rowIndex}>
                              {row?.map((cell: any, cellIndex: number) => (
                                <td
                                  key={cellIndex}
                                  dangerouslySetInnerHTML={{
                                    __html: cell || "",
                                  }}
                                  className="border text-start px-3 py-[6px] overflow-hidden text-black-500"
                                />
                              ))}
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              );
            default:
              return null;
          }
        })()}
      </Fragment>
    );
  } catch (error) {
    return (
      <div className="text-red-500 text-center">
        Error rendering content. Please try refreshing the page.
      </div>
    );
  }
};
