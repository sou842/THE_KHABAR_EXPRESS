import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
    blogId: mongoose.Types.ObjectId;
    reason: string;
    details?: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

ReportSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
