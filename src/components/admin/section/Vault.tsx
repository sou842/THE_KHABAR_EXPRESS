import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database,
  PlusIcon,
  Terminal,
  FileBox
} from 'lucide-react';
import type { VaultItem } from './vault/types';
import PromptsTab from './vault/PromptsTab';
import FeaturePlansTab from './vault/FeaturePlansTab';
import { VaultSkeleton } from './vault/VaultSkeleton';
import { getter, poster, putter, deleter } from '@/lib/helper';

const fetcher = (url: string) => getter(url).then((res: any) => res.data);

export default function Vault() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'feature_plan'>('prompt');

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('vault_active_tab');
    if (savedTab === 'prompt' || savedTab === 'feature_plan') {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleTabChange = (tab: 'prompt' | 'feature_plan') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_active_tab', tab);
    }
  };
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [formLoading, setFormLoading] = useState(false);

  // SWR for data fetching
  const { data: items = [], error, isLoading, mutate } = useSWR<VaultItem[]>(
    `/api/admin/vault?type=${activeTab}`,
    fetcher
  );

  // Fetch users for assignment selection
  const { data: usersData = [] } = useSWR('/api/users', fetcher);
  const users = usersData?.response || usersData; // In case the backend wraps it in a response object

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setFormLoading(true);
    try {
      const result = await poster('/api/admin/vault', {
        title: formData?.title,
        content: formData?.content,
        type: activeTab,
        status: 'pending'
      });
      if (result && result?.success) {
        // Optimistic update for creation
        mutate([result?.data, ...items], false);
        setFormData({ title: '', content: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error creating vault item:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    const previousItems = [...items];
    mutate(
      items?.map(item => item?._id === id ? { ...item, status: newStatus as any } : item),
      false
    );

    try {
      const result = await putter(`/api/admin/vault/${id}`, { status: newStatus });
      if (!result || !result.success) {
        mutate(previousItems, false);
      } else {
        // Revalidate to ensure consistency
        mutate();
      }
    } catch (error) {
      console.error('Error updating vault item:', error);
      mutate(previousItems, false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const previousItems = [...items];
    mutate(items?.filter(item => item?._id !== id), false);
    
    try {
      const result = await deleter(`/api/admin/vault/${id}`);
      if (!result || !result?.success) {
        mutate(previousItems, false);
      } else {
        mutate();
      }
    } catch (error) {
      console.error('Error deleting vault item:', error);
      mutate(previousItems, false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 min-h-[calc(100vh-60px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Vault</h2>
            <p className="text-sm text-muted-foreground">Manage your dynamic data, prompts, and feature plans here.</p>
          </div>
        </div>
        
        {showAddForm ? (
          <Button variant="outline" className='hover:bg-primary/10' onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="hidden md:flex gap-2">
            <PlusIcon className="w-4 h-4" /> 
            Add {activeTab === 'prompt' ? 'Prompt' : 'Feature Plan'}
          </Button>
        )}
      </div>

      <div className="flex gap-4 mb-6 flex-shrink-0">
        <button 
          onClick={() => handleTabChange('prompt')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center transition-all ${activeTab === 'prompt' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
        >
          <Terminal className="w-4 h-4" /> Prompts
        </button>
        <button 
          onClick={() => handleTabChange('feature_plan')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center transition-all ${activeTab === 'feature_plan' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
        >
          <FileBox className="w-4 h-4" /> Feature Plans
        </button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-card border-border shadow-sm flex-shrink-0">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. SEO Optimization Prompt"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder={activeTab === 'prompt' ? "Enter your prompt template here..." : "Describe the feature plan in detail..."}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error ? (
        <div className="text-center py-12 text-destructive bg-destructive/10 rounded-xl border border-dashed border-destructive/20 flex-1">
          <p className="font-medium">Failed to load {activeTab === 'prompt' ? 'prompts' : 'feature plans'}</p>
        </div>
      ) : isLoading ? (
        <VaultSkeleton type={activeTab} />
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border flex-1">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
          <p className="text-sm">There are no {activeTab === 'prompt' ? 'prompts' : 'feature plans'} saved in the vault.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowAddForm(true)}>
            Create First {activeTab === 'prompt' ? 'Prompt' : 'Plan'}
          </Button>
        </div>
      ) : activeTab === 'prompt' ? (
        <PromptsTab items={items} handleDelete={handleDelete} />
      ) : (
        <FeaturePlansTab 
          items={items} 
          users={Array.isArray(users) ? users : []}
          handleDelete={handleDelete} 
          handleUpdateStatus={handleUpdateStatus}
          handleAssignUser={async (id: string, assignedTo: string[]) => {
            const result = await putter(`/api/admin/vault/${id}`, { assignedTo });
            if (result && result.success) mutate();
          }}
        />
      )}
    </div>
  );
}
