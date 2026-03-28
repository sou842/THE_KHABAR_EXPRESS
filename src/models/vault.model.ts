import mongoose from 'mongoose';

const VaultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['prompt', 'feature_plan'],
    default: 'prompt'
  },
  content: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'achieved', 'discussion'],
    default: 'pending'
  },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Delete model if already registered to ensure latest schema is used during development
if (mongoose.models && mongoose.models.Vault) {
  delete (mongoose.models as any).Vault;
}

export const Vault = mongoose.model('Vault', VaultSchema);
