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
    enum: ['pending', 'in-progress', 'achieved', 'archived'],
    default: 'pending'
  },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Next.js Hot Reload frequently caches old Mongoose schemas.
// We delete the cached Vault model so it picks up the newly added assignedTo field.
if (mongoose.models.Vault) {
  delete mongoose.models.Vault;
}

export const Vault = mongoose.model('Vault', VaultSchema);
