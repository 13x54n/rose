import { idManager } from './idManager';
import Constants from 'expo-constants';

export type FileType = 'photo' | 'video' | 'music' | 'document' | 'folder';

export interface IPFSFile {
    id: string;
    name: string;
    type: FileType;
    size?: string;
    date: string;
    uri?: string; // For photos/videos
    parentId?: string; // For nested folders
    itemsCount?: number; // For folders
}

// Backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * FileService now fetches data from the backend MongoDB registry.
 */
export const FileService = {
    /**
     * Fetches media items from the backend for the current installation.
     */
    getFiles: async (parentId: string = 'root', typeFilter?: FileType | 'all'): Promise<IPFSFile[]> => {
        try {
            const installationId = await idManager.getInstallationId();

            // Handle localhost/debugger IP replacement
            let finalUrl = BACKEND_URL;
            if (__DEV__ && finalUrl.includes('localhost')) {
                const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
                if (debuggerHost) {
                    finalUrl = finalUrl.replace('localhost', debuggerHost);
                }
            }

            console.log(`[FileService] Fetching media from backend: ${finalUrl}/api/v1/media/${installationId}`);

            const response = await fetch(`${finalUrl}/api/v1/media/${installationId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch media: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`[FileService] Fetched ${data.length} items from backend.`);

            // Map backend MediaItem to UI IPFSFile
            let files: IPFSFile[] = data.map((item: any) => {
                console.log(`[FileService] Mapping item: ${item.filename}, URI: ${item.uri}`);
                return {
                    id: item.localId,
                    name: item.filename,
                    type: item.mediaType === 'video' ? 'video' : 'photo',
                    date: item.creationTime ? new Date(item.creationTime).toISOString().split('T')[0] : 'Unknown',
                    uri: item.uri,
                    size: item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'N/A',
                    parentId: 'root'
                };
            });

            if (typeFilter && typeFilter !== 'all') {
                files = files.filter(f => f.type === typeFilter);
            }

            return files;
        } catch (error) {
            console.error('[FileService] Error fetching media from backend:', error);
            return [];
        }
    },

    /**
     * Specifically used for the main library grid.
     */
    getAllPhotos: async (): Promise<IPFSFile[]> => {
        return FileService.getFiles('root', 'photo');
    },

    /**
     * Deletes a file from the backend registry.
     */
    deleteFile: async (localId: string): Promise<boolean> => {
        try {
            const installationId = await idManager.getInstallationId();

            let finalUrl = BACKEND_URL;
            if (__DEV__ && finalUrl.includes('localhost')) {
                const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
                if (debuggerHost) {
                    finalUrl = finalUrl.replace('localhost', debuggerHost);
                }
            }

            console.log(`[FileService] Deleting media: ${localId}`);

            const response = await fetch(`${finalUrl}/api/v1/media/${installationId}/${localId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete media: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('[FileService] Error deleting media:', error);
            return false;
        }
    },

    /**
     * Imports a file (simulated IPFS registration).
     */
    importFile: async (asset: any): Promise<boolean> => {
        try {
            const installationId = await idManager.getInstallationId();

            let finalUrl = BACKEND_URL;
            if (__DEV__ && finalUrl.includes('localhost')) {
                const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
                if (debuggerHost) {
                    finalUrl = finalUrl.replace('localhost', debuggerHost);
                }
            }

            console.log(`[FileService] Importing media: ${asset.filename}`);

            // Simulate IPFS URI
            const curatedIds = [
                '1506929562872-bb421503ef21', '1472214103451-9374bd1c798e', '1544005313-94ddf0286df2',
                '1464822759023-fed622ff2c3b', '1519681393797-a12042f159a9', '1480796927426-f609979314bd',
                '1554080353-a576cf803bda', '1504198472253-18e95107a41e', '1500462918059-b1a0cb512f1d',
                '1534528741775-53994a69daeb', '1506160413824-f7a702b85a3c', '1517849845537-4d257902454a'
            ];
            const imageId = curatedIds[Math.floor(Math.random() * curatedIds.length)];
            const simulatedUri = `https://images.unsplash.com/photo-${imageId}?q=80&w=400&auto=format&fit=crop`;

            const item = {
                id: asset.id,
                filename: asset.filename,
                mediaType: asset.mediaType,
                uri: simulatedUri,
                creationTime: asset.creationTime,
            };

            const response = await fetch(`${finalUrl}/api/v1/media/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    installationId,
                    mediaItems: [item],
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to import media: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('[FileService] Error importing media:', error);
            return false;
        }
    }
};
