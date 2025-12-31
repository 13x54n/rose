import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { File, Folder, Music, PlayCircle, MoreVertical } from 'lucide-react-native';
import { IPFSFile } from '../services/FileService';
import { Colors } from '../constants/Theme';

interface FileCardProps {
    file: IPFSFile;
    onPress: (file: IPFSFile) => void;
    onLongPress?: (file: IPFSFile) => void;
    viewMode: 'grid' | 'list';
    isSelected?: boolean;
    selectionMode?: boolean;
}

export default function FileCard({ file, onPress, onLongPress, viewMode, isSelected, selectionMode }: FileCardProps) {
    const isGrid = viewMode === 'grid';

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderIcon = () => {
        if (file.type === 'photo' || file.type === 'video') {
            return (
                <View style={{ width: '100%', height: '100%' }}>
                    <Image
                        source={{ uri: file.uri }}
                        style={isGrid ? styles.gridImage : styles.listImage}
                        contentFit="cover"
                        transition={200}
                    />
                    {file.type === 'video' && (
                        <View style={styles.videoIndicator}>
                            <PlayCircle size={isGrid ? 20 : 16} color="#fff" fill="rgba(0,0,0,0.3)" />
                        </View>
                    )}
                </View>
            );
        }
        if (file.type === 'folder') return <Folder size={isGrid ? 40 : 24} color={Colors.dark.accent} strokeWidth={1.5} />;
        if (file.type === 'music') return <Music size={isGrid ? 40 : 24} color="#EC4899" strokeWidth={1.5} />;
        return <File size={isGrid ? 40 : 24} color={Colors.dark.textSecondary} strokeWidth={1.5} />;
    };

    if (isGrid) {
        return (
            <Pressable
                style={styles.gridContainer}
                onPress={() => onPress(file)}
                onLongPress={() => onLongPress?.(file)}
            >
                <View style={[styles.gridIconContainer, file.type === 'photo' && styles.noPadding]}>
                    {renderIcon()}
                </View>
                {selectionMode && (
                    <View style={styles.selectionIndicator}>
                        <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                            {isSelected && <View style={styles.checkInner} />}
                        </View>
                    </View>
                )}
                {/* Removed text for standard photo grid look, or keep only for non-photos? 
                    Let's hide text for photos to match "Gallery" look. */}
                {file.type !== 'photo' && (
                    <View style={styles.gridInfo}>
                        {file.type === 'video' && file.duration ? (
                            <Text style={styles.durationText}>{formatDuration(file.duration)}</Text>
                        ) : (
                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                        )}
                    </View>
                )}
            </Pressable>
        );
    }

    return (
        <Pressable style={styles.listContainer} onPress={() => onPress(file)}>
            <View style={styles.listIconWrapper}>
                {renderIcon()}
            </View>
            <View style={styles.listInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileDetail}>
                    {file.date} • {file.type === 'folder' ? `${file.itemsCount} items` : file.size}
                </Text>
            </View>
            <Pressable hitSlop={10}>
                <MoreVertical size={20} color={Colors.dark.textSecondary} />
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Grid Styles
    gridContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.dark.background,
    },
    gridIconContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    noPadding: {
        padding: 0,
        backgroundColor: 'transparent',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridInfo: {
        gap: 4,
    },

    // List Styles
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.dark.background,
        marginBottom: 1,
        gap: 16,
    },
    listIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.dark.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    listInfo: {
        flex: 1,
        gap: 4,
    },

    // Common
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    fileDetail: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
    },
    selectionIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 5,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleSelected: {
        backgroundColor: Colors.dark.accent,
        borderColor: Colors.dark.accent,
    },
    checkInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    durationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        position: 'absolute',
        bottom: 6,
        right: 6,
    },
    videoIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -10 }, { translateY: -10 }],
    }
});
