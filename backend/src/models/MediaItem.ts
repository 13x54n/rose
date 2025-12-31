import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaItem extends Document {
    installationId: string;
    localId: string;
    filename: string;
    mediaType: string;
    uri: string;
    width?: number;
    height?: number;
    creationTime: Date;
    modificationTime: Date;
    duration?: number;
    size?: number;
    cid?: string;
    isFavorite?: boolean;
}

const MediaItemSchema: Schema = new Schema({
    installationId: { type: String, required: true, index: true },
    localId: { type: String, required: true },
    filename: { type: String, required: true },
    mediaType: { type: String, required: true },
    uri: { type: String },
    width: { type: Number },
    height: { type: Number },
    creationTime: { type: Date },
    modificationTime: { type: Date },
    duration: { type: Number },
    size: { type: Number },
    cid: { type: String, index: true },
    isFavorite: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Ensure unique combination of installationId and localId
MediaItemSchema.index({ installationId: 1, localId: 1 }, { unique: true });

export default mongoose.model<IMediaItem>('MediaItem', MediaItemSchema);
