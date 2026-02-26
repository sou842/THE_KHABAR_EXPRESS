import mongoose, { Document, Schema } from 'mongoose';

// ========= Contributor Schema =========
export interface IContributor extends Document {    
    email: string;
    note: string;
    createdAt: Date;
}

const ContributorSchema = new Schema<IContributor>({    
    createdAt: { type: Date, default: Date.now },
    note: { type: String },
    email: { type: String, required: true },
});

export const Contributor = mongoose.models.Contributor || mongoose.model<IContributor>('Contributor', ContributorSchema);
