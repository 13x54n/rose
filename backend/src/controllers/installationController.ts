import { Request, Response } from 'express';
import Installation from '../models/Installation';

/**
 * Handles recording or updating an app installation.
 */
export const syncInstallation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId, deviceInfo, timestamp } = req.body;

        if (!installationId) {
            res.status(400).json({ error: 'installationId is required' });
            return;
        }

        console.log(`[Installation] Syncing ID: ${installationId}`);

        // Update or create the installation record in MongoDB
        const updatedInstallation = await Installation.findOneAndUpdate(
            { installationId },
            {
                deviceInfo,
                lastSync: timestamp || new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Installation synced successfully',
            data: updatedInstallation
        });
    } catch (error: any) {
        console.error('[Installation] Sync error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
