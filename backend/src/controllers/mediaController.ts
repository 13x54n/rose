import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import MediaItem from '../models/MediaItem';

const execAsync = promisify(exec);

/**
 * Syncs a list of media items from a device.
 */
export const syncMediaRegistry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId, mediaItems } = req.body;

        if (!installationId || !Array.isArray(mediaItems)) {
            res.status(400).json({ error: 'installationId and mediaItems array are required' });
            return;
        }

        console.log(`[MediaRegistry] Syncing ${mediaItems.length} items for ID: ${installationId}`);

        // Use bulkWrite for efficiency
        const operations = mediaItems.map((item: any) => ({
            updateOne: {
                filter: { installationId, localId: item.id },
                update: {
                    $set: {
                        filename: item.filename,
                        mediaType: item.mediaType,
                        uri: item.uri,
                        width: item.width,
                        height: item.height,
                        creationTime: item.creationTime ? new Date(item.creationTime) : undefined,
                        modificationTime: item.modificationTime ? new Date(item.modificationTime) : undefined,
                        duration: item.duration,
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await MediaItem.bulkWrite(operations);
        }

        res.status(200).json({
            message: 'Media registry synced successfully',
            count: operations.length
        });
    } catch (error: any) {
        console.error('[MediaRegistry] Sync error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Retrieves media items for a specific installation.
 */
export const getMediaRegistry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId } = req.params;

        if (!installationId) {
            res.status(400).json({ error: 'installationId is required' });
            return;
        }

        console.log(`[MediaRegistry] Fetching items for ID: ${installationId}`);

        const items = await MediaItem.find({ installationId }).sort({ creationTime: -1 });

        res.status(200).json(items);
    } catch (error: any) {
        console.error('[MediaRegistry] Fetch error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Deletes a single media item.
 */
export const deleteMediaItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId, localId } = req.params;

        if (!installationId || !localId) {
            res.status(400).json({ error: 'installationId and localId are required' });
            return;
        }

        console.log(`[MediaRegistry] Deleting item ${localId} for ID: ${installationId}`);

        // 1. Find the item to get the CID
        const item = await MediaItem.findOne({ installationId, localId });

        if (!item) {
            res.status(404).json({ error: 'Media item not found' });
            return;
        }

        // 2. Unpin from IPFS if CID exists
        if (item.cid) {
            try {
                console.log(`[IPFS] Unpinning CID: ${item.cid}`);
                await execAsync(`ipfs pin rm ${item.cid}`);
            } catch (unpinError: any) {
                console.warn(`[IPFS] Failed to unpin ${item.cid}:`, unpinError.message);
                // Continue with DB deletion even if unpin fails (might already be unpinned)
            }
        }

        // 3. Delete from DB
        await MediaItem.deleteOne({ installationId, localId });

        res.status(200).json({ message: 'Media item deleted successfully from DB and IPFS' });
    } catch (error: any) {
        console.error('[MediaRegistry] Delete error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }

};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId, localId } = req.params;

        const item = await MediaItem.findOne({ installationId, localId });
        if (!item) {
            res.status(404).json({ error: 'Media item not found' });
            return;
        }

        item.isFavorite = !item.isFavorite;
        await item.save();

        res.status(200).json({
            message: 'Favorite status updated',
            isFavorite: item.isFavorite,
            localId
        });
    } catch (error: any) {
        console.error('[MediaRegistry] Toggle Favorite error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Uploads a media item to IPFS and stores its metadata.
 */
export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { installationId } = req.body;
        const file = req.file;

        if (!installationId) {
            res.status(400).json({ error: 'installationId is required' });
            return;
        }

        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        console.log(`[MediaRegistry] Uploading file for ${installationId}: ${file.filename}`);

        // 1. Add to IPFS via shell command
        // Standard output format: "added <CID> <filename>"
        const { stdout, stderr } = await execAsync(`ipfs add "${file.path}"`);

        if (stderr && !stdout) {
            console.error('[IPFS] Error adding file:', stderr);
            throw new Error(`IPFS add failed: ${stderr}`);
        }

        // Parse CID from output
        const parts = stdout.split(' ');
        const cid = parts[1];

        if (!cid) {
            throw new Error('Failed to parse CID from IPFS output');
        }

        console.log(`[IPFS] File added with CID: ${cid}`);

        // 2. Pin the CID
        await execAsync(`ipfs pin add ${cid}`);

        // 3. Create Backend Proxy URL
        // Instead of IPFS gateway, use our own backend endpoint
        const backendUrl = process.env.API_URL || `http://10.0.0.144:5000`;
        const proxyUri = `${backendUrl}/api/v1/media/view/${cid}`;

        // 4. Store metadata in DB
        const mediaItem = new MediaItem({
            installationId,
            localId: `remote_${Date.now()}`,
            filename: file.originalname,
            mediaType: file.mimetype.startsWith('image/') ? 'photo' : 'video',
            uri: proxyUri,
            size: file.size,
            creationTime: new Date(),
            modificationTime: new Date(),
            cid: cid,
        });

        await mediaItem.save();

        // 5. Clean up uploads temp file
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.warn('[Cleanup] Failed to delete temp file:', err);
        }

        res.status(201).json({
            message: 'File added to IPFS successfully',
            cid: cid,
            uri: proxyUri,
            item: mediaItem
        });
    } catch (error: any) {
        console.error('[MediaRegistry] Upload error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Serves media directly from IPFS (streaming).
 */
export const viewIpfsMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cid } = req.params;

        console.log(`[IPFS] Streaming ${cid} from IPFS...`);

        // Use ipfs cat to stream the file content directly to the response
        const { spawn } = require('child_process');
        const ipfs = spawn('ipfs', ['cat', cid]);

        ipfs.stdout.on('data', (data: Buffer) => {
            res.write(data);
        });

        ipfs.stdout.on('end', () => {
            res.end();
        });

        ipfs.stderr.on('data', (data: Buffer) => {
            console.error(`[IPFS] stderr: ${data}`);
        });

        ipfs.on('close', (code: number) => {
            if (code !== 0) {
                console.error(`[IPFS] process exited with code ${code}`);
                if (!res.headersSent) {
                    res.status(404).json({ error: 'Failed to retrieve file from IPFS' });
                }
            }
        });

    } catch (error: any) {
        console.error('[MediaRegistry] View error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
