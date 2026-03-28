import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, MessageSquare, TrashIcon, PlusIcon, X, Users } from 'lucide-react';
import { useState, useCallback, ReactNode } from 'react';
import type { VaultItem } from './types';

type ItemStatus = 'pending' | 'in-progress' | 'achieved' | 'discussion';

interface ColumnConfig {
  status: ItemStatus;
  label: string;
  icon: ReactNode;
  dropHint: string;
}

interface FeaturePlansTabProps {
  items: VaultItem[];
  users: any[];
  handleDelete: (id: string) => void;
  handleUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  handleAssignUser: (id: string, assignedTo: string[]) => void;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'pending',
    label: 'Pending',
    icon: <Clock className="w-4 h-4 text-yellow-500" aria-hidden />,
    dropHint: 'Drop here to mark as pending',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    icon: <Clock className="w-4 h-4 text-blue-500" aria-hidden />,
    dropHint: 'Drop here to mark as in progress',
  },
  {
    status: 'achieved',
    label: 'Achieved',
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden />,
    dropHint: 'Drop here to mark as achieved',
  },
  {
    status: 'discussion',
    label: 'Discussion',
    icon: <MessageSquare className="w-4 h-4 text-purple-500" aria-hidden />,
    dropHint: 'Drop here for discussion',
  },
];

const ACCENT_COLORS: Record<ItemStatus, string> = {
  pending: 'bg-yellow-400',
  'in-progress': 'bg-blue-400',
  achieved: 'bg-green-500',
  discussion: 'bg-purple-400',
};

export default function FeaturePlansTab({
  items,
  users = [],
  handleDelete,
  handleUpdateStatus,
  handleAssignUser,
}: FeaturePlansTabProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ItemStatus | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedItemId(null);
    setDragOverStatus(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, status: ItemStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOverStatus(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, newStatus: ItemStatus) => {
      e.preventDefault();
      const id = draggedItemId ?? e.dataTransfer.getData('text/plain');
      if (id) handleUpdateStatus(id, newStatus);
      setDraggedItemId(null);
      setDragOverStatus(null);
    },
    [draggedItemId, handleUpdateStatus],
  );

  const onKeyboardMove = useCallback(
    (itemId: string, currentStatus: ItemStatus) => {
      const currentIndex = COLUMNS.findIndex((c) => c.status === currentStatus);
      const nextStatus = COLUMNS[(currentIndex + 1) % COLUMNS.length].status;
      handleUpdateStatus(itemId, nextStatus);
    },
    [handleUpdateStatus],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
        <CheckCircle2 className="w-8 h-8 opacity-30" />
        <p className="text-sm">No feature plans yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-320px)] min-h-[500px]"
      role="application"
      aria-label="Feature plans kanban board"
    >
      {COLUMNS.map(({ status, label, icon, dropHint }) => {
        const columnItems = items.filter((item) => item.status === status);
        const isDropTarget = dragOverStatus === status;

        return (
          <div
            key={status}
            role="region"
            aria-label={`${label} column – ${columnItems.length} item${columnItems.length !== 1 ? 's' : ''}`}
            className={[
              'rounded-xl p-3 flex flex-col h-full border shadow-inner transition-colors duration-150',
              isDropTarget
                ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30'
                : 'bg-muted/30 border-border/50',
            ].join(' ')}
            onDragOver={(e) => onDragOver(e, status)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, status)}
            aria-dropeffect="move"
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                {icon}
                {label}
              </h3>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {columnItems.length}
              </Badge>
            </div>

            {/* Drop hint — empty column while dragging */}
            {isDropTarget && columnItems.length === 0 && (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-lg">
                <p className="text-xs text-primary/60">{dropHint}</p>
              </div>
            )}

            {/* Empty column state */}
            {!isDropTarget && columnItems.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/40 italic">No items</p>
              </div>
            )}

            {/* Items */}
            {columnItems.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
                {columnItems.map((item) => (
                  <Card
                    key={item._id}
                    draggable
                    onDragStart={(e) => onDragStart(e, item._id)}
                    onDragEnd={onDragEnd}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item.title?.replace(/_/g, ' ')} – ${label}. Press Enter to move to next column.`}
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onKeyboardMove(item._id, status);
                      }
                    }}
                    className={[
                      'relative overflow-hidden p-0 bg-card border-border/60 rounded-xl cursor-grab active:cursor-grabbing transition-all select-none hover:border-border hover:shadow-sm',
                      draggedItemId === item._id ? 'opacity-40 scale-95' : 'opacity-100',
                    ].join(' ')}
                  >
                    {/* Status accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${ACCENT_COLORS[status]}`} />

                    <div className="pl-4 pr-3 py-3">
                      {/* Title + grip */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-[14px] leading-snug text-foreground flex-1">
                          {item.title?.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex flex-col gap-[3px] pt-1 shrink-0 opacity-30" aria-hidden>
                          <span className="block w-[14px] h-[1.5px] bg-foreground rounded" />
                          <span className="block w-[14px] h-[1.5px] bg-foreground rounded" />
                          <span className="block w-[14px] h-[1.5px] bg-foreground rounded" />
                        </div>
                      </div>

                      {/* Content preview */}
                      {item.content && (
                        <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                          {item.content}
                        </p>
                      )}

                      {/* Footer: avatars + date */}
                      <div className="flex items-center justify-between">
                        {item?.assignedTo && item?.assignedTo?.length > 0 ? (
                          <div className="flex">
                            {item?.assignedTo?.map((u) => (
                              <div
                                key={u._id}
                                title={u.name}
                                className="w-[22px] h-[22px] rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[9px] font-semibold border-2 border-card uppercase -ml-1 first:ml-0 cursor-help"
                              >
                                {u?.name?.substring(0, 2)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                          <Clock className="w-3 h-3" aria-hidden />
                          <time dateTime={new Date(item.createdAt).toISOString()}>
                            {new Date(item.createdAt).toLocaleDateString('en-GB')}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Right Sidebar Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col pt-10 px-8 pb-8 transition-transform transform duration-300">
            <div className="flex justify-between items-start mb-6 gap-4">
              <h2 className="text-xl font-semibold text-foreground break-all">
                {selectedItem.title?.replace(/_/g, ' ')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedItem(null)}
                className="shrink-0 text-muted-foreground hover:bg-muted border border-transparent rounded-full hover:border-border w-9 h-9"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-6 text-sm">
              <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/50 border border-border/50 capitalize text-foreground/80">
                {selectedItem.status.replace(/-/g, ' ')}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Assignees
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedItem.assignedTo?.map((u) => (
                  <Badge key={u._id} variant="secondary" className="flex items-center gap-1 group pr-1 py-1">
                    {u.name}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded-full p-0.5"
                      onClick={() => {
                        const newAssignees =
                          selectedItem.assignedTo?.filter((x) => x._id !== u._id).map((x) => x._id) ?? [];
                        handleAssignUser(selectedItem._id, newAssignees);
                        setSelectedItem({
                          ...selectedItem,
                          assignedTo: selectedItem.assignedTo?.filter((x) => x._id !== u._id),
                        });
                      }}
                      title="Remove assignee"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </Badge>
                ))}

                <div className="relative inline-block">
                  <select
                    className="opacity-0 absolute inset-0 w-full cursor-pointer h-full z-10"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const newAssignees = [...(selectedItem.assignedTo?.map((x) => x._id) ?? []), val];
                      handleAssignUser(selectedItem._id, newAssignees);
                      const addedUser = users.find((u) => u._id === val);
                      if (addedUser) {
                        setSelectedItem({
                          ...selectedItem,
                          assignedTo: [
                            ...(selectedItem.assignedTo ?? []),
                            { _id: addedUser._id, name: addedUser.name, email: addedUser.email },
                          ],
                        });
                      }
                    }}
                  >
                    <option value="" disabled>Select User</option>
                    {users
                      .filter((u) => !selectedItem.assignedTo?.find((x) => x._id === u._id))
                      .map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                  </select>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed rounded-full px-3">
                    <PlusIcon className="w-3 h-3" /> Assign
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-3">
                Description
              </h3>
              <div className="text-sm bg-muted/20 border border-border/50 rounded-xl p-4 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {selectedItem.content}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 border-0 flex items-center justify-center gap-2"
                onClick={() => {
                  handleDelete(selectedItem._id);
                  setSelectedItem(null);
                }}
              >
                <TrashIcon className="w-4 h-4" />
                Delete Feature Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}