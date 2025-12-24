import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Dimensions, Platform, Alert, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Stack, useRouter, useFocusEffect, useNavigation, Tabs } from 'expo-router';
import { Camera, Plus, Search, Share, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { FileService, IPFSFile } from '../../services/FileService';
import FileCard from '../../components/FileCard';
import { Colors } from '../../constants/Theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 4;
const GAP = 2; // px
const ITEM_SIZE = (SCREEN_WIDTH - (COLUMN_COUNT - 1) * GAP) / COLUMN_COUNT;



export default function FileBrowser() {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [files, setFiles] = useState<IPFSFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('Oct 9, 2024 - Today');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Fixed view mode for "Photos" tab
    const viewMode = 'grid';

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const dates = viewableItems
                .map((vi: any) => vi.item.date)
                .filter((d: string) => d !== 'Unknown')
                .sort();

            if (dates.length > 0) {
                const start = dates[0];
                const end = dates[dates.length - 1];

                const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const today = new Date().toISOString().split('T')[0];
                    if (dateStr === today) return 'Today';

                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                };

                if (start === end) {
                    setDateRange(formatDate(start));
                } else {
                    setDateRange(`${formatDate(start)} - ${formatDate(end)}`);
                }
            }
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 10,
    }).current;

    const loadFiles = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await FileService.getAllPhotos();
            setFiles(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFiles(files.length === 0); // Only show loader if we have no files yet
        }, [files.length])
    );

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('library-refresh', () => {
            console.log('[Library] Refresh event received');
            loadFiles(false); // Silent refresh
        });
        return () => subscription.remove();
    }, []);

    const handleImport = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "This app needs access to your gallery to import photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const success = await FileService.importFile({
                id: asset.assetId || `import-${Date.now()}`,
                filename: asset.fileName || 'imported_photo.jpg',
                mediaType: 'photo',
                creationTime: new Date().toISOString(),
            });

            if (success) {
                loadFiles(false);
                Alert.alert("Success", "Photo imported to your IPFS registry!");
            } else {
                Alert.alert("Error", "Failed to import photo.");
            }
        }
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);

        if (next.size === 0) {
            setSelectionMode(false);
        }
    };

    const handleFilePress = (file: IPFSFile) => {
        if (selectionMode) {
            toggleSelection(file.id);
            return;
        }

        if (file.type === 'photo') {
            router.push({
                pathname: '/viewer',
                params: {
                    uri: file.uri,
                    date: file.date,
                    name: file.name,
                    id: file.id
                }
            });
        }
    };

    const handleLongPress = (file: IPFSFile) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedIds(new Set([file.id]));
        }
    };

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = async () => {
        const count = selectedIds.size;
        Alert.alert(
            "Delete Photos",
            `Are you sure you want to delete ${count} selected ${count === 1 ? 'photo' : 'photos'}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        for (const id of selectedIds) {
                            await FileService.deleteFile(id);
                        }
                        cancelSelection();
                        loadFiles(false);
                        Alert.alert("Success", `${count} ${count === 1 ? 'photo' : 'photos'} deleted.`);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Tabs.Screen
                options={{
                    tabBarStyle: selectionMode ? { display: 'none', height: 0 } : {
                        position: 'absolute',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 85,
                        backgroundColor: Platform.OS === 'android' ? Colors.dark.background : 'transparent',
                    }
                }}
            />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.dark.accent} />
                </View>
            ) : (
                <FlatList
                    key={viewMode}
                    data={files}
                    renderItem={({ item }) => (
                        <View style={{ width: ITEM_SIZE, height: ITEM_SIZE }}>
                            <FileCard
                                file={item}
                                onPress={handleFilePress}
                                onLongPress={handleLongPress}
                                isSelected={selectedIds.has(item.id)}
                                selectionMode={selectionMode}
                                viewMode={viewMode}
                            />
                        </View>
                    )}
                    keyExtractor={item => item.id}
                    numColumns={COLUMN_COUNT}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 100, paddingBottom: 100 }]}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No files found</Text>
                        </View>
                    }
                />
            )}

            {/* Blurred Header */}
            <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Library</Text>
                        {/* Dynamic Date Range based on visibility */}
                        <Text style={styles.headerSubtitle}>{dateRange}</Text>
                    </View>

                    <Pressable
                        style={[styles.selectButton, selectionMode && styles.activeSelectButton]}
                        onPress={() => selectionMode ? cancelSelection() : setSelectionMode(true)}
                    >
                        <Text style={styles.selectButtonText}>{selectionMode ? 'Cancel' : 'Select'}</Text>
                    </Pressable>
                </View>
            </BlurView>

            {/* Selection Toolbar (Replaces Tab Bar) */}
            {selectionMode && (
                <View style={[styles.selectionToolbar, { height: 75 + insets.bottom, paddingBottom: insets.bottom }]}>
                    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.toolbarContent}>
                        <TouchableOpacity style={styles.toolbarIcon}>
                            <Share size={22} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.selectionCount}>
                            {selectedIds.size} {selectedIds.size === 1 ? 'Photo' : 'Photos'} Selected
                        </Text>

                        <TouchableOpacity style={styles.toolbarIcon} onPress={handleDeleteSelected}>
                            <Trash2 size={22} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    selectButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    selectButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },

    listContent: {
        padding: 0,
        // paddingBottom/Top managed inline with insets
    },
    columnWrapper: {
        gap: 2, // Tiny gap between photos
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.background,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.dark.textSecondary,
        fontSize: 16,
    },
    // FABS can remain similar but update colors
    fab: {
        position: 'absolute',
        bottom: 100, // Higher because of tab bar
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.dark.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    camFab: {
        position: 'absolute',
        bottom: 110,
        right: 90,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#34C759', // Green
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSelectButton: {
        backgroundColor: Colors.dark.accent,
    },
    selectionToolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.1)',
        zIndex: 9999,
        elevation: 100,
        overflow: 'hidden',
    },
    toolbarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
    },
    toolbarIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionCount: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.2,
    }
});
