import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IFaqItem {
    question: string;
    answer: string;
}

export interface IBlog extends Document {
    title: string;
    body: any;
    thumbnail: any;
    category: string;
    tags: string[];
    author: string;
    authorId: mongoose.Types.ObjectId;
    publishedDate: Date;
    // isTrending: boolean;
    status: { type: String, enum: ['approved', 'pending', 'rejected'] };
    editorType: string;
    views: number;
    videoUrl?: string;
    language: 'en' | 'hi';
    url: string;
    createdAt: Date;
    updatedAt: Date;
    isTrending: Boolean;
    faqs?: IFaqItem[];
    aiSummary?: {
        mainIdea: string;
        keyPoints: string[];
        finalTakeaway: string;
        suggestedQuestions: string[];
    };
    translations?: {
        [lang: string]: {
            title: string;
            body: any;
        }
    };
}



const BlogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    body: { type: Schema.Types.Mixed, required: true },
    thumbnail: { type: Schema.Types.Mixed, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedDate: { type: Date },
    // isTrending: { type: Boolean, default: false },
    status: { type: String, default: 'pending' },
    editorType: { type: String },
    views: { type: Number, default: 0 },
    videoUrl: { type: String },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isTrending: { type: Boolean, default: false },
    faqs: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
    aiSummary: {
        mainIdea: { type: String },
        keyPoints: [{ type: String }],
        finalTakeaway: { type: String },
        suggestedQuestions: [{ type: String }],
    },
    translations: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

BlogSchema.pre('save', function (next) {
    this.updatedAt = new Date();

    if (this?.isNew || !this?.url) {
        const title = this?.title || "untitled";
        const slug = title
            ?.trim()
            ?.replace(/\?/g, "")
            ?.replace(/&/g, "and")
            ?.replace(/[^\w\s-]/g, "")
            ?.replace(/\s+/g, "-")
            ?.toLowerCase();

        const suffix = uuidv4().split("-")[0];
        this.url = `${slug}-${suffix}`;
    }

    next();
});

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
