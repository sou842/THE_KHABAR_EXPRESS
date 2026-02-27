import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyBlock, dracula } from "react-code-blocks";
import { 
  CalendarIcon, 
  GlobeIcon, 
  NewspaperIcon, 
  ChevronRightIcon, 
  ArrowLeftIcon,
  ListIcon,
  FileTextIcon,
  ExternalLinkIcon,
  CodeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskItem {
  title: string;
  description: string;
  source: string;
  url: string;
  published: boolean;
}

interface TaskListData {
  data: TaskItem[];
  category: string;
  timestamp: string;
  createdAt: string;
  _id: string;
}

export default function TaskList() {
  const [taskLists, setTaskLists] = useState<TaskListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskListData | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleJsonView = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const response = await fetch('/api/tasklist');
        const result = await response.json();
        
        if (result.success) {
          setTaskLists(result.data);
        }
      } catch (error) {
        console.error('Error fetching task lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskLists();
  }, []);

  useEffect(() => {
    // Reset expanded items when selecting a new task
    setExpandedItems({});
  }, [selectedTask]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[240px]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-border border-t-primary animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium tracking-wide">Loading task lists...</p>
        </div>
      </div>
    );
  }

  if (!taskLists.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[240px] text-muted-foreground">
        <NewspaperIcon className="w-12 h-12 mb-3 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-1 text-foreground">No Task Lists Found</h3>
        <p className="text-sm font-medium">There are no task lists available at the moment.</p>
      </div>
    );
  }

  if (selectedTask) {
    return (
      <div className="max-w-7xl min-h-screen mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedTask(null)}
            className="flex items-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 group text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to List
          </Button>
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {selectedTask.data.length} Articles
          </Badge>
        </div>

        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {selectedTask.category} News
          </h2>
          <div className="flex items-center text-xs text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="grid gap-3">
          {selectedTask.data.map((item, index) => (
            <Card key={index} className="overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="p-4 border border-border rounded-xl bg-card">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                    <FileTextIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">{item.title}</h3>
                      <Badge 
                        variant={item.published ? "default" : "secondary"}
                        className={`ml-3 text-xs flex-shrink-0 ${
                          item.published ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                        }`}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 leading-normal text-sm">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs pt-3 border-t">
                      <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                        <NewspaperIcon className="w-4 h-4 mr-2" />
                        {item.source}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleJsonView(index)}
                          className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-7 py-1 px-3 text-xs"
                        >
                          <CodeIcon className="w-4 h-4 mr-2" />
                          {expandedItems[index] ? 'Hide JSON' : 'View JSON'}
                        </Button>
                        
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 group"
                        >
                          <ExternalLinkIcon className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                          Read Full Article
                        </a>
                      </div>
                    </div>

                    {expandedItems[index] && (
                      <div className="mt-3 rounded-md max-h-60 overflow-x-auto overflow-y-auto text-[13px] leading-tight">
                        <CopyBlock
                          text={JSON.stringify(item, null, 2)}
                          language="json"
                          theme={dracula}
                          showLineNumbers={false}
                          codeBlock={true}
                          customStyle={{ maxHeight: '240px', overflow: 'auto' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full min-h-screen mx-auto p-4">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Task Lists</h2>
        <Badge variant="outline" className="px-3 py-1 text-xs border-border">
          {taskLists.length} Collections
        </Badge>
      </div>

      <div className="grid gap-4">
        {taskLists?.map((taskList) => (
          <Card 
            key={taskList._id}
            className="group cursor-pointer border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            onClick={() => setSelectedTask(taskList)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <ListIcon className="w-5 h-5 text-primary" />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {taskList?.category}
                    </h3>
                    <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted border-none">
                      {taskList?.data?.length} articles
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(taskList?.createdAt)?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}