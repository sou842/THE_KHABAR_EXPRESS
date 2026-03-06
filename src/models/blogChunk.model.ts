import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogChunk extends Document {
    blogId: mongoose.Types.ObjectId;
    content: string;
    embedding: number[];
    index: number;
    createdAt: Date;
}

const BlogChunkSchema = new Schema<IBlogChunk>({
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    index: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

// For RAG search efficiency (though Atlas Vector Search uses its own indexing)
BlogChunkSchema.index({ blogId: 1 });

export const BlogChunk = mongoose.models.BlogChunk || mongoose.model<IBlogChunk>('BlogChunk', BlogChunkSchema);
