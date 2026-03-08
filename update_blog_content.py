import re

# 1. Create DynamicCodeBlock.tsx
with open("src/components/DynamicCodeBlock.tsx", "w") as f:
    f.write("""import React from "react";
import { CopyBlock, dracula } from "react-code-blocks";

export default function DynamicCodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <CopyBlock
      text={code}
      language={language}
      showLineNumbers={false}
      codeBlock={true}
      theme={dracula}
    />
  );
}
""")

# 2. Update BlogContent.tsx
with open("src/components/BlogContent.tsx", "r") as f:
    content = f.read()

# Update signature
old_sig = "export const BlogContent: FC<{ block: any }> = ({ block }) => {"
new_sig = "export const BlogContent: FC<{ block: any; isFirst?: boolean }> = ({ block, isFirst = false }) => {"
content = content.replace(old_sig, new_sig)

# Add Imports & remove react-code-blocks
imports_old = """import { FC, Fragment, Suspense } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import dynamic from "next/dynamic";
import { getRandomFallbackImage } from "@/lib/blogUtils";"""
imports_new = """import { FC, Fragment, Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getRandomFallbackImage } from "@/lib/blogUtils";

const DynamicCodeBlock = dynamic(() => import("./DynamicCodeBlock"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-muted/30 border border-border rounded-sm animate-pulse flex items-center justify-center">
      <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Loading code...</span>
    </div>
  ),
});

const FallbackImageInline = ({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) => {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => { setImgSrc(src); }, [src]);
  return (
    <Image 
      src={imgSrc} 
      alt={alt} 
      width={1200}
      height={675}
      sizes="(max-width: 1200px) 100vw, 1200px"
      className={`object-cover ${className || ""}`}
      style={{ width: '100%', height: 'auto' }}
      priority={priority}
      onError={() => setImgSrc(getRandomFallbackImage())}
    />
  );
};"""
content = content.replace(imports_old, imports_new)

# Update image return
img_old = """                  <img
                    className={`w-full h-auto object-cover ${
                      !stretched && !withBackground ? "rounded-sm" : ""
                    } ${withBorder ? "border border-border p-1" : ""}`}
                    loading="lazy"
                    src={imageUrl}
                    alt={safelyAccessData(block, "data.caption", "Article image")}
                    itemProp="contentUrl"
                    onError={(e) => {
                      e.currentTarget.src = getRandomFallbackImage();
                      e.currentTarget.onerror = null;
                    }}
                  />"""
img_new = """                  <FallbackImageInline
                    className={`w-full h-auto object-cover ${
                      !stretched && !withBackground ? "rounded-sm" : ""
                    } ${withBorder ? "border border-border p-1" : ""}`}
                    priority={isFirst}
                    src={imageUrl}
                    alt={safelyAccessData(block, "data.caption", "Article image")}
                  />"""
content = content.replace(img_old, img_new)

# Update code return
code_old = """                  <CopyBlock
                    text={safelyAccessData(block, codeProp, "// No code provided")}
                    language={safelyAccessData(block, "data.language", defaultLang)}
                    showLineNumbers={false}
                    codeBlock={true}
                    theme={dracula}
                  />"""
code_new = """                  <DynamicCodeBlock
                    code={safelyAccessData(block, codeProp, "// No code provided")}
                    language={safelyAccessData(block, "data.language", defaultLang)}
                  />"""
content = content.replace(code_old, code_new)

with open("src/components/BlogContent.tsx", "w") as f:
    f.write(content)

print("BlogContent.tsx and DynamicCodeBlock updated successfully.")
