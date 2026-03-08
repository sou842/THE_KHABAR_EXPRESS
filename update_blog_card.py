import re

with open("src/components/BlogCard.tsx", "r") as f:
    content = f.read()

# 1. Add imports and FallbackImage component
imports = """import { Eye, ArrowUpRight } from "lucide-react";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import Image from "next/image";
import { useState } from "react";

const FallbackImage = ({ src, alt, className, priority, fallbackSrc }: { src: string; alt: string; className?: string; priority?: boolean; fallbackSrc: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image 
      src={imgSrc} 
      alt={alt} 
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={`object-cover ${className || ""}`}
      priority={priority}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
};
"""
content = re.sub(r'import { Eye, ArrowUpRight } from "lucide-react";\nimport DateTimeDisplay from "@/components/DateTimeDisplay";', imports, content, count=1)

# 2. Update hero
hero_old = """                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={getImageUrl(blog)!} 
                    alt={blog.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                      e.currentTarget.onerror = null;
                    }}
                  />"""
hero_new = """                  <FallbackImage 
                    src={getImageUrl(blog)!} 
                    alt={blog.title} 
                    priority={true}
                    fallbackSrc="https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop"
                  />"""
content = content.replace(hero_old, hero_new)

# 3. Update topStory (including adding relative)
topstory_old = """            <div className="w-full aspect-square bg-muted rounded-sm overflow-hidden">
              {getImageUrl(blog) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={getImageUrl(blog)!} 
                  alt={blog.title} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                    e.currentTarget.onerror = null;
                  }}
                />
              )}
            </div>"""
topstory_new = """            <div className="relative w-full aspect-square bg-muted rounded-sm overflow-hidden">
              {getImageUrl(blog) && (
                <FallbackImage 
                  src={getImageUrl(blog)!} 
                  alt={blog.title} 
                  className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  fallbackSrc="https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop"
                />
              )}
            </div>"""
content = content.replace(topstory_old, topstory_new)

# 4. Update featured/default/editorPick
featured_old = """              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={getImageUrl(blog)!} 
                alt={blog?.title} 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                  e.currentTarget.onerror = null;
                }}
              />"""
featured_new = """              <FallbackImage 
                src={getImageUrl(blog)!} 
                alt={blog?.title || "Blog cover image"} 
                className="grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                fallbackSrc="https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop"
              />"""
content = content.replace(featured_old, featured_new)

# 5. Update mostRead (add relative)
mostread_old = """            <div className="bg-muted aspect-video rounded-sm overflow-hidden">
              {getImageUrl(blog) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={getImageUrl(blog)!} 
                  alt={blog?.title} 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                    e.currentTarget.onerror = null;
                  }}
                />
              ) : ("""
mostread_new = """            <div className="relative bg-muted aspect-video rounded-sm overflow-hidden">
              {getImageUrl(blog) ? (
                <FallbackImage 
                  src={getImageUrl(blog)!} 
                  alt={blog?.title || "Blog cover image"} 
                  className="grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  fallbackSrc="https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop"
                />
              ) : ("""
content = content.replace(mostread_old, mostread_new)

# 6. Update adminRow
adminrow_old = """                {getImageUrl(blog) && <img
                  src={getImageUrl(blog)!}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200';
                    e.currentTarget.onerror = null;
                  }}
                />}"""
adminrow_new = """                {getImageUrl(blog) && <FallbackImage
                  src={getImageUrl(blog)!}
                  alt="Thumbnail"
                  className="group-hover:scale-105 transition-transform duration-500 ease-out"
                  fallbackSrc="https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200"
                />}"""
content = content.replace(adminrow_old, adminrow_new)

with open("src/components/BlogCard.tsx", "w") as f:
    f.write(content)

print("BlogCard.tsx updated successfully.")
