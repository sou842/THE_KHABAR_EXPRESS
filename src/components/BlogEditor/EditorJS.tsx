import React, { useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import CodeTool from "@editorjs/code";
import ImageTool from "@editorjs/image";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import InlineCode from "@editorjs/inline-code";
import type { BlockToolConstructable } from "@editorjs/editorjs";
import InlineImage from "editorjs-inline-image";
import { MultiTagEdit } from "../MultiTagSelector";
import { toast } from "sonner";
import ConfirmationDialog from "../ConfirmationDialog";
import DragDrop from "editorjs-drag-drop";
import YouTubeEmbed from "editorjs-youtube-embed";
import Marker from "@editorjs/marker";
import LinkTool from "@editorjs/link";
import Warning from "@editorjs/warning";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import { DefaultEditorJS } from "@/assets/static";
import FAQManager from "./FaqManager";
import { IFaqItem } from "./FaqSchema";

interface TextEditorProps {
  handleContentSave: (data: any) => void;
  editContent?: any;
  editMode?: boolean;
  category: string;
  setCategory: (type: string) => void;
  confirmationData?: any;
  defaultCategory?: string[];
  setDefaultCategory?: (type: string[]) => void;
  faqs?: IFaqItem[];
}

class CustomYouTubeEmbed {
  private youTubeEmbed: typeof YouTubeEmbed;

  constructor({ data, config, api, readOnly }: any) {
    this.youTubeEmbed = new YouTubeEmbed({ data, config, api, readOnly });
  }

  static get toolbox() {
    const originalToolbox = YouTubeEmbed.toolbox;
    return {
      ...originalToolbox,
      title: "Video / YouTube",
    };
  }

  render() {
    return this.youTubeEmbed.render();
  }

  save(blockContent: any) {
    return this.youTubeEmbed.save(blockContent);
  }
}

const TextEditor: React.FC<TextEditorProps> = (props) => {
  const {
    handleContentSave,
    category,
    setCategory,
    editMode = false,
    editContent,
    confirmationData,
    defaultCategory,
    setDefaultCategory,
    faqs: faqsList
  } = props;
  const editorInstance = useRef<EditorJS | null>(null);
  const [open, onOpenChange] = useState<boolean>(false);
  const [faqs, setFaqs] = useState<IFaqItem[] | any>(faqsList);
  const handleSaveDraft = debounce((editorInstance: any) => {
    editorInstance
      .save()
      .then((outputData: any) => {
        localStorage.setItem("draft", JSON.stringify(outputData.blocks));
      })
      .catch((error: any) => {
        console.error("Saving failed:", error);
      });
  }, 700);

  const contentManager = () => {
    const draft = localStorage.getItem("draft") || null;

    if (editMode && !!editContent) {
      return editContent;
    }
    return draft ? JSON.parse(draft) : DefaultEditorJS;
  };

  useEffect(() => {
    // Create a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const editorElement = document.getElementById('editorjs');

      if (editorElement && !editorInstance?.current) {
        editorInstance.current = new EditorJS({
          holder: 'editorjs',
          tools: {
            header: {
              class: Header as unknown as BlockToolConstructable,
              config: {
                placeholder: "Start writing your content...",
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
              },
              inlineToolbar: true,
            },
            list: {
              class: List as unknown as BlockToolConstructable,
              inlineToolbar: true,
            },
            code: { class: CodeTool as unknown as BlockToolConstructable },
            // image: {
            //   class: ImageTool as unknown as BlockToolConstructable,
            //   config: {
            //     endpoints: { byFile: "https://your-server.com/uploadImage" },
            //   },
            // },
            quote: {
              class: Quote as unknown as BlockToolConstructable,
              inlineToolbar: true,
            },
            table: {
              class: Table as unknown as BlockToolConstructable,
              inlineToolbar: true,
            },
            inlineCode: {
              class: InlineCode as unknown as BlockToolConstructable,
            },
            inlineImage: {
              class: InlineImage as unknown as BlockToolConstructable,
              inlineToolbar: true,
              config: {
                embed: {
                  display: true,
                },
              },
            },
            youtubeEmbed: {
              class: CustomYouTubeEmbed, // Register custom YouTube Embed tool
              config: {
                placeholder: "Enter YouTube video link",
              },
            },
            marker: {
              class: Marker,
              shortcut: "CMD+SHIFT+M",
            },
            linkTool: {
              class: LinkTool,
              config: {
                endpoint: "http://localhost:8008/fetchUrl", // Your endpoint that provides URL metadata
              },
            },
            warning: {
              class: Warning,
              config: {
                titlePlaceholder: "Title",
                messagePlaceholder: "Message",
              },
            },
          },
          data: {
            blocks: contentManager(),
          },
          onChange: () => {
            handleSaveDraft(editorInstance.current);
          },
          onReady: () => {
            if (editorInstance?.current) {
              new DragDrop(editorInstance?.current);
            }
          },
          placeholder: "Start writing your content...",
        });
      } else if (!editorElement) {
        console.error("Editor element with ID 'editorjs' not found in the DOM");
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      if (
        editorInstance?.current &&
        typeof editorInstance.current.destroy === "function"
      ) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  const handleConfirmContent = () => {
    onOpenChange(true);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    image: string;
  }) => {
    if (editorInstance?.current) {
      try {
        const savedData: OutputData = await editorInstance?.current?.save();

        if (savedData && savedData?.blocks) {
          handleContentSave?.({
            content: savedData?.blocks,
            editorType: "EDITORJS",
            category: category,
            thumbnail: data,
            faqs
          });
        } else {
          toast.error("Something went wrong, please try again.");
        }
      } catch (error) {
        toast.error("Something went wrong, please try again.");
      }
    }
  };

  return (
    <>
      <div id="editorjs" className="min-h-[300px] w-full"></div>
      <button
        onClick={handleConfirmContent}
        className="w-fit absolute top-0 right-0 z-10 px-3 py-1.5 rounded-full bg-khabar-500 text-white font-semibold"
      >
        Save
      </button>
      <FAQManager {...{ faqs, setFaqs }} />
      <div
        id="hide_scrollbar"
        className="w-fit max-w-full md:max-w-[650px] m-auto sticky bottom-1.5 z-50"
      >


        {/* multiple tag selector */}
        <MultiTagEdit
          category={category}
          setCategory={setCategory}
          defaultCategory={defaultCategory}
          setDefaultCategory={setDefaultCategory}
        />
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={open}
          category={category}
          handleSave={handleSave}
          setCategory={setCategory}
          onOpenChange={onOpenChange}
          confirmationData={confirmationData}
          editConfirmation={editMode}
          defaultCategory={defaultCategory}
          setDefaultCategory={setDefaultCategory}
        />
      </div>
    </>
  );
};

export default TextEditor;
