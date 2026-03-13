export interface VaultItem {
  _id: string;
  title: string;
  type: 'prompt' | 'feature_plan';
  content: string;
  status: 'pending' | 'in-progress' | 'achieved' | 'archived';
  assignedTo?: { _id: string; name: string; email: string }[];
  createdAt: string;
}
