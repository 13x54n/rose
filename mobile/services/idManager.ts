import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const INSTALLATION_ID_KEY = 'rose_installation_id';

/**
 * Manages the unique installation ID for the application.
 */
export const idManager = {
    /**
     * Retrieves the existing installation ID or generates a new one.
     */
    async getInstallationId(): Promise<string> {
        try {
            // Try to get existing ID from secure storage
            let id = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);

            if (!id) {
                // Generate a new UUID if no ID exists using expo-crypto (native)
                id = Crypto.randomUUID();
                await SecureStore.setItemAsync(INSTALLATION_ID_KEY, id);

                console.log('[idManager] Generated new installation ID:', id);
            } else {
                console.log('[idManager] Retrieved existing installation ID:', id);
            }

            return id;
        } catch (error) {
            console.error('[idManager] Error getting installation ID:', error);
            // Fallback to a non-persistent UUID if SecureStore fails
            try {
                return Crypto.randomUUID();
            } catch (e) {
                return 'temp-' + Date.now();
            }
        }
    },

    /**
     * Returns hardware-related info if needed.
     */
    async getDeviceInfo(): Promise<any> {
        return {
            platform: Platform.OS,
            osVersion: Platform.Version,
            applicationName: Application.applicationName,
            applicationVersion: Application.nativeApplicationVersion,
            buildNumber: Application.nativeBuildVersion,
        };
    },

    /**
     * Syncs the installation ID with the backend.
     */
    async syncWithBackend(backendUrl: string): Promise<void> {
        try {
            const id = await this.getInstallationId();
            const deviceInfo = await this.getDeviceInfo();

            // If backendUrl is localhost, try to replace it with the debugger host IP for devices
            let finalUrl = backendUrl;
            if (__DEV__ && finalUrl.includes('localhost')) {
                const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
                if (debuggerHost) {
                    finalUrl = finalUrl.replace('localhost', debuggerHost);
                    console.log(`[idManager] Replaced localhost with debugger host: ${debuggerHost}`);
                }
            }

            console.log(`[idManager] Syncing ID ${id} with ${finalUrl}...`);

            const response = await fetch(`${finalUrl}/api/v1/installations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    installationId: id,
                    deviceInfo,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend sync failed: Status ${response.status} - ${errorText || response.statusText}`);
            }

            console.log('[idManager] Successfully synced with backend.');
        } catch (error) {
            console.error('[idManager] Backend sync error:', error);
        }
    }
};
