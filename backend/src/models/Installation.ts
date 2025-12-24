import mongoose, { Schema, Document } from 'mongoose';

export interface IInstallation extends Document {
    installationId: string;
    deviceInfo: any;
    lastSync: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InstallationSchema: Schema = new Schema({
    installationId: { type: String, required: true, unique: true },
    deviceInfo: { type: Object, default: {} },
    lastSync: { type: Date, default: Date.now },
}, {
    timestamps: true
});

export default mongoose.model<IInstallation>('Installation', InstallationSchema);
