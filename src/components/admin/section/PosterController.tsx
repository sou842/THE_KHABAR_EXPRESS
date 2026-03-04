import React from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import { posterTemplates } from './PosterTemplates';

interface BlogOption {
    label: string;
    value: string;
    blog: any;
}

const fetchBlogs = async (inputValue: string): Promise<BlogOption[]> => {
    const res = await fetch(`/api/blogs?limit=5&search=${inputValue}`);
    const result = await res?.json();
    return result?.data?.map((blog: any) => ({ 
      label: blog?.title, 
      value: blog?._id, 
      blog: {
        ...blog,
        thumbnail: blog?.thumbnail?.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000',
        description: blog?.thumbnail?.description || blog?.subtitle
      }
    }));
};

const loadOptions = (inputValue: string, callback: (options: BlogOption[]) => void) => {
    fetchBlogs(inputValue).then(callback);
};

interface PosterControllerProps {
  onBlogSelect: (blog: any) => void;
  onTemplateChange?: (templateId: string) => void;
  currentTemplate?: string;
  showTemplates?: boolean;
}

const PosterController: React.FC<PosterControllerProps> = ({ onBlogSelect, onTemplateChange, currentTemplate, showTemplates = true }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Target Article</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" strokeWidth={1.5} />
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            onChange={(option: any) => onBlogSelect(option?.blog ?? null)}
            placeholder="Search for a post..."
            isClearable
            unstyled
            classNames={{
              control: () => 'pl-9 pr-3 py-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border/70 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 text-sm font-medium transition-all duration-200',
              placeholder: () => 'text-xs text-muted-foreground/50',
              input: () => 'text-foreground',
              singleValue: () => 'text-foreground',
              menu: () => 'mt-2 p-2 rounded-xl border border-border/60 bg-card shadow-2xl z-50',
              option: ({ isFocused }) => `px-4 py-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${isFocused ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`,
            }}
          />
        </div>
      </div>

      {showTemplates && (
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Visual Template</label>
          <div className="grid grid-cols-2 gap-4">
            {posterTemplates?.map((tpl) => (
              <button
                key={tpl?.id}
                onClick={() => onTemplateChange?.(tpl?.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-center group ${
                  currentTemplate === tpl?.id 
                    ? 'bg-primary/5 border-primary ring-1 ring-primary/20' 
                    : 'bg-card border-border/40 hover:border-border/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`w-full aspect-video rounded-lg bg-foreground/80 flex items-center justify-center shadow-inner relative overflow-hidden`}>
                   {tpl?.icon && (
                     <tpl.icon className={`w-6 h-6 text-white transition-transform duration-500 group-hover:scale-110 ${
                       currentTemplate === tpl?.id ? 'opacity-100' : 'opacity-80'
                     }`} />
                   )}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-tight">{tpl?.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterController;
