import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { idManager } from './idManager';

/**
 * Manages local media scanning and synchronization with the backend.
 */
export const mediaManager = {
    /**
     * Uploads a new capture to the backend (IPFS storage).
     */
    async uploadCapture(backendUrl: string, uri: string, options: { type: 'photo' | 'video' }): Promise<string> {
        try {
            const installationId = await idManager.getInstallationId();

            // Handle localhost/debugger IP replacement
            let finalUrl = backendUrl;
            if (__DEV__ && finalUrl.includes('localhost')) {
                const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
                if (debuggerHost) {
                    finalUrl = finalUrl.replace('localhost', debuggerHost);
                }
            }

            console.log(`[mediaManager] Uploading ${options.type} to ${finalUrl}...`);

            const formData = new FormData();
            formData.append('installationId', installationId);

            // @ts-ignore - React Native FormData expects an object with uri, type, name
            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: options.type === 'photo' ? 'image/jpeg' : 'video/quicktime',
                name: `${options.type}_${Date.now()}.${options.type === 'photo' ? 'jpg' : 'mov'}`,
            });

            const response = await fetch(`${finalUrl}/api/v1/media/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // Note: fetch automatically sets 'multipart/form-data' and boundary when body is FormData
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[mediaManager] Upload successful:', data.cid);

            return data.uri; // This is the proxy URI returned by the backend
        } catch (error) {
            console.error('[mediaManager] Error uploading capture:', error);
            throw error;
        }
    }
};
