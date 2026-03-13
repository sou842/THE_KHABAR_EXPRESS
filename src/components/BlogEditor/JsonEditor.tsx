import React, { useState } from "react";
import { toast } from "sonner";
import { FileJson, Upload, Trash2, LayoutPanelLeft, Eye, Code2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogContent } from "@/components/BlogContent";

interface JsonEditorProps {
  handleContentSave: (data: any) => Promise<any>;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ handleContentSave }) => {
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [view, setView] = useState<"code" | "preview">("code");
  const [parsedData, setParsedData] = useState<any>(null);

  // Helper to fix JSON that has markdown links appended outside of quotes
  // Pattern: "some text" [youtube](url) -> "some text"
  // The old regex was broken (greedy, ate string content). This one is correct.
  const cleanJsonContent = (content: string) => {
    try {
      // Strip any [text](url) annotations that appear immediately after a closing quote
      return content.replace(/"(\s*\[[^\]]*\]\([^)]*\))+/g, '"');
    } catch (e) {
      return content;
    }
  };

  const handleFormat = () => {
    try {
      if (!jsonContent.trim()) return;
      setIsFormatting(true);
      const cleaned = cleanJsonContent(jsonContent);
      const parsed = JSON.parse(cleaned);
      setJsonContent(JSON.stringify(parsed, null, 2));
      toast.success("JSON cleaned and formatted");
    } catch (error) {
      toast.error("Invalid JSON format. Please check for syntax errors.");
    } finally {
      setIsFormatting(false);
    }
  };

  const toggleView = () => {
    if (view === "code") {
      try {
        if (!jsonContent.trim()) {
          return toast.error("Please paste JSON content first");
        }
        const cleaned = cleanJsonContent(jsonContent);
        const parsed = JSON.parse(cleaned);
        setParsedData(parsed);
        setView("preview");
      } catch (error) {
        toast.error("Invalid JSON. Cannot preview.");
      }
    } else {
      setView("code");
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the content?")) {
      setJsonContent("");
      setParsedData(null);
      if (view === "preview") setView("code");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!jsonContent.trim()) {
        return toast.error("Please paste JSON content first");
      }

      const cleaned = cleanJsonContent(jsonContent);
      const dataToSubmit = view === "preview" && parsedData ? parsedData : JSON.parse(cleaned);
      
      // Basic validation of required fields for our backend
      if (!dataToSubmit.title || !dataToSubmit.body) {
        return toast.error("JSON must contain at least 'title' and 'body' fields");
      }

      const payload = {
        content: dataToSubmit.body,
        category: dataToSubmit.category || "technology",
        thumbnail: dataToSubmit.thumbnail || { title: dataToSubmit.title, description: "", image: "" },
        editorType: dataToSubmit.editorType || "EDITORJS",
        faqs: dataToSubmit.faqs || [],
        title: dataToSubmit.title, 
        tags: dataToSubmit.tags || [dataToSubmit.category],
        author: dataToSubmit.author,
        authorId: dataToSubmit.authorId,
        url: dataToSubmit.url,
      };

      await handleContentSave(payload);
    } catch (error) {
      console.error("JSON Upload Error:", error);
      toast.error("Invalid JSON data. Please check the format.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
        {/* Toolbar */}
        <div className="bg-muted/30 border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-khabar-500/10 p-2 rounded-lg">
              <FileJson className="w-5 h-5 text-khabar-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">JSON Article Upload</h2>
              <p className="text-xs text-muted-foreground">Paste raw JSON content to create a blog post instantly.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-background border border-border/60 rounded-full p-1 mr-2">
               <button 
                 onClick={() => setView("code")}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${view === "code" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
               >
                 <Code2 className="w-3.5 h-3.5" />
                 Code
               </button>
               <button 
                 onClick={toggleView}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${view === "preview" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
               >
                 <Eye className="w-3.5 h-3.5" />
                 Preview
               </button>
            </div>

            {view === "code" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFormat}
                disabled={isFormatting || !jsonContent.trim()}
                className="gap-2 h-9 px-4 rounded-full border-border/60 hover:bg-muted"
              >
                <LayoutPanelLeft className="w-4 h-4" />
                Format
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
              disabled={!jsonContent.trim()}
              className="gap-2 h-9 px-4 rounded-full border-border/60 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === "code" ? (
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder='{
  "title": "My Awesome Article",
  "body": [...],
  "category": "technology",
  ...
}'
              className="w-full h-full p-6 bg-transparent text-sm font-mono text-foreground focus:outline-none resize-none placeholder:text-muted-foreground/30 selection:bg-khabar-500/20"
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 overflow-y-auto bg-background p-8 md:p-12">
              <div className="max-w-3xl mx-auto">
                {/* Preview Header */}
                <div className="mb-10 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-khabar-500 mb-4 block">
                    {parsedData?.category || "Category"}
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                    {parsedData?.title || "Article Title"}
                  </h1>
                  
                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground border-y border-border/50 py-4 mb-10">
                    <span className="font-bold text-foreground/80">{parsedData?.author || "Author Name"}</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 opacity-40" />
                      <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {parsedData?.thumbnail?.image && (
                    <figure className="mb-12">
                       <img 
                        src={parsedData.thumbnail.image} 
                        alt={parsedData.thumbnail.title || "Featured Image"} 
                        className="w-full aspect-[16/9] object-cover rounded-xl shadow-2xl shadow-khabar-500/10"
                      />
                      {parsedData.thumbnail.description && (
                        <figcaption className="mt-4 text-sm italic text-muted-foreground text-center">
                          {parsedData.thumbnail.description}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>

                {/* Preview Content */}
                <div className="flex flex-col gap-0 items-center">
                  {Array.isArray(parsedData?.body) ? (
                    parsedData.body.map((block: any, index: number) => (
                      <BlogContent key={index} block={block} isFirst={index === 0} />
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No content blocks found in "body" field.</p>
                  )}
                </div>

                {/* FAQs Preview */}
                {parsedData?.faqs?.length > 0 && (
                  <div className="mt-16 pt-10 border-t border-border">
                    <h3 className="text-xl font-bold font-serif mb-6 text-foreground">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                      {parsedData.faqs.map((faq: any, i: number) => (
                        <div key={i} className="bg-muted/30 p-5 rounded-xl border border-border/50">
                          <h4 className="font-bold text-foreground mb-2">{faq.question}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border/50 px-6 py-4 flex items-center justify-end gap-3">
          <p className="text-[11px] text-muted-foreground mr-auto max-w-[60%]">
             Ensure your JSON follows the required schema including <code className="text-foreground">title</code>, <code className="text-foreground">body</code>, and <code className="text-foreground">category</code>.
          </p>
          <Button 
            onClick={handleSubmit} 
            disabled={!jsonContent.trim()}
            className="bg-khabar-500 hover:bg-khabar-600 text-white gap-2 px-8 h-10 rounded-full shadow-lg shadow-khabar-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload Article
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JsonEditor;
