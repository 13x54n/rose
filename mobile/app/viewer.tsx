import { View, Text, StyleSheet, Image, Pressable, Dimensions, FlatList, Alert, DeviceEventEmitter, TouchableWithoutFeedback, Share as RNShare } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal, Share, Heart, Info, Sliders, Trash } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useState, useEffect, useRef } from 'react';
import { FileService, IPFSFile } from '../services/FileService';
import { Image as ExpoImage } from 'expo-image';

import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');
const THUMB_SIZE = 40;
const THUMB_GAP = 4;
const ITEM_WIDTH = THUMB_SIZE + THUMB_GAP;

const VideoItem = ({ uri, shouldPlay }: { uri: string; shouldPlay: boolean }) => {
    const player = useVideoPlayer(uri, player => {
        player.loop = true;
    });

    useEffect(() => {
        if (shouldPlay) {
            player.play();
        } else {
            player.pause();
        }
    }, [shouldPlay, player]);

    return (
        <VideoView
            style={styles.mainImage}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={false}
        />
    );
};

export default function PhotoViewer() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // State
    const [photos, setPhotos] = useState<IPFSFile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhoto, setCurrentPhoto] = useState<IPFSFile | null>(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    // Initial Params

    // Initial Params
    const initialId = params.id as string;
    const initialDate = params.date as string || 'Unknown Date';

    // Refs
    // Use simple Refs for lists to avoid re-renders on scroll
    const mainListRef = useRef<FlatList>(null);
    const scrubberListRef = useRef<FlatList>(null);

    // Calculate padding to center the thumbnail
    // Screen Width / 2 - Half Item Width
    const centerPadding = (width - ITEM_WIDTH) / 2;

    useEffect(() => {
        const loadPhotos = async () => {
            const allMedia = await FileService.getAllMedia();
            // Optional: filter if we only want to view valid media
            setPhotos(allMedia);

            // Find current index based on ID
            if (initialId) {
                const index = allMedia.findIndex((p: IPFSFile) => p.id === initialId);
                if (index !== -1) {
                    setCurrentIndex(index);
                    setCurrentPhoto(allMedia[index]);
                    // Needs a slight delay to scroll after layout
                    setTimeout(() => {
                        mainListRef.current?.scrollToIndex({ index, animated: false });
                        scrubberListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                    }, 100);
                } else if (allMedia.length > 0) {
                    setCurrentPhoto(allMedia[0]);
                }
            } else if (allMedia.length > 0) {
                setCurrentPhoto(allMedia[0]);
            }
        };
        loadPhotos();
    }, [initialId]);

    const handleBack = () => {
        router.back();
    };

    // Called when main list swipe momentum ends
    const handleMomentumScrollEnd = (ev: any) => {
        const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
        if (newIndex >= 0 && newIndex < photos.length) {
            setCurrentIndex(newIndex);
            setCurrentPhoto(photos[newIndex]);
            // Scroll scrubber to keep sync, centering the item
            scrubberListRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0.5 });
        }
    };

    const handleScrubberPress = (index: number) => {
        if (index === currentIndex) return;
        setCurrentIndex(index);
        setCurrentPhoto(photos[index]);
        mainListRef.current?.scrollToIndex({ index, animated: false }); // Instant jump
        scrubberListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    };

    const handleDelete = async () => {
        if (!currentPhoto) return;

        Alert.alert(
            "Delete Photo",
            "Are you sure you want to delete this photo from your IPFS registry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await FileService.deleteFile(currentPhoto.id);
                        if (success) {
                            DeviceEventEmitter.emit('library-refresh');
                            router.back();
                        } else {
                            Alert.alert("Error", "Failed to delete photo.");
                        }
                    }
                }
            ]
        );
    };

    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    const handleShare = async () => {
        if (!currentPhoto) return;
        try {
            await RNShare.share({
                url: currentPhoto.uri,
                title: 'Share Photo',
                message: 'Check out this photo!',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleFavorite = async () => {
        if (!currentPhoto) return;
        const newStatus = !currentPhoto.isFavorite;

        // Optimistic update
        setCurrentPhoto(prev => prev ? { ...prev, isFavorite: newStatus } : null);
        setPhotos(prev => prev.map(p => p.id === currentPhoto.id ? { ...p, isFavorite: newStatus } : p));

        const result = await FileService.toggleFavorite(currentPhoto.id);
        if (!result.success) {
            // Revert on failure
            setCurrentPhoto(prev => prev ? { ...prev, isFavorite: !newStatus } : null);
            setPhotos(prev => prev.map(p => p.id === currentPhoto.id ? { ...p, isFavorite: !newStatus } : p));
            Alert.alert("Error", "Failed to update favorite status");
        } else {
            DeviceEventEmitter.emit('library-refresh');
        }
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return { date: 'Unknown Date', time: '' };
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
            time: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
    };

    const { date: displayDate, time: displayTime } = formatDate(currentPhoto?.creationTime || new Date().toISOString());

    // Render Items
    const renderMainItem = ({ item }: { item: IPFSFile }) => {
        if (item.type === 'video') {
            return (
                <TouchableWithoutFeedback onPress={toggleControls}>
                    <View style={styles.imageWrapper}>
                        <VideoItem
                            uri={item.uri || ''}
                            shouldPlay={currentIndex === photos.indexOf(item)}
                        />
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <TouchableWithoutFeedback onPress={toggleControls}>
                <View style={styles.imageWrapper}>
                    <ExpoImage
                        source={{ uri: item.uri || '' }}
                        style={styles.mainImage}
                        contentFit="contain"
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    };

    const renderThumbnail = ({ item, index }: { item: IPFSFile, index: number }) => {
        const isActive = index === currentIndex;
        return (
            <Pressable onPress={() => handleScrubberPress(index)} style={styles.thumbWrapper}>
                <Image
                    source={{ uri: item.uri }}
                    style={[styles.thumb, isActive && styles.activeThumb]}
                />
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            {showControls && (
                <BlurView intensity={30} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
                    <View style={styles.headerContent}>
                        <Pressable onPress={handleBack} style={styles.backButton}>
                            <ChevronLeft size={32} color="#0A84FF" />
                        </Pressable>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerDate}>{displayDate}</Text>
                            <Text style={styles.headerTime}>{displayTime}</Text>
                        </View>
                        <Pressable style={styles.menuButton}>
                            <MoreHorizontal size={24} color="#0A84FF" />
                        </Pressable>
                    </View>
                </BlurView>
            )}

            {/* Main Paging List */}
            <FlatList
                ref={mainListRef}
                data={photos}
                renderItem={renderMainItem}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
                scrollEnabled={scrollEnabled}
                style={styles.mainList}
            />

            {/* Scrubber */}
            {showControls && (
                <View style={[styles.scrubberContainer, { bottom: 90 + insets.bottom }]}>
                    <FlatList
                        ref={scrubberListRef}
                        data={photos}
                        renderItem={renderThumbnail}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: centerPadding,
                            alignItems: 'center'
                        }}
                        getItemLayout={(data, index) => (
                            { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
                        )}
                    />
                </View>
            )}

            {/* Bottom Toolbar */}
            {showControls && (
                <BlurView intensity={80} tint="dark" style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <Pressable style={styles.toolbarButton} onPress={handleShare}><Share size={24} color="#0A84FF" /></Pressable>
                    <Pressable style={styles.toolbarButton} onPress={handleFavorite}>
                        <Heart size={24} color={currentPhoto?.isFavorite ? "#FF3B30" : "#0A84FF"} fill={currentPhoto?.isFavorite ? "#FF3B30" : "transparent"} />
                    </Pressable>
                    <Pressable style={styles.toolbarButton} onPress={() => setShowInfo(true)}><Info size={24} color="#0A84FF" /></Pressable>
                    <Pressable style={styles.toolbarButton}><Sliders size={24} color="#0A84FF" /></Pressable>
                    <Pressable style={styles.toolbarButton} onPress={handleDelete}><Trash size={24} color="#0A84FF" /></Pressable>
                </BlurView>
            )}

            {/* Info Metadata Sheet */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showInfo}
                onRequestClose={() => setShowInfo(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowInfo(false)}>
                    <BlurView intensity={80} tint="dark" style={[styles.infoSheet, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.handle} />
                        <Text style={styles.infoTitle}>Info</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Filename</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{currentPhoto?.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{displayDate} {displayTime}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Size</Text>
                            <Text style={styles.infoValue}>{currentPhoto?.size}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Type</Text>
                            <Text style={styles.infoValue}>{currentPhoto?.type.toUpperCase()}</Text>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowInfo(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </BlurView>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingBottom: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerDate: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTime: {
        color: '#8E8E93',
        fontSize: 12,
    },
    menuButton: {
        padding: 4,
    },

    mainList: {
        flex: 1,
    },
    imageWrapper: {
        width: width,
        height: '100%',
        justifyContent: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },

    scrubberContainer: {
        position: 'absolute',
        bottom: 90, // Above toolbar
        left: 0,
        right: 0,
        height: 50,
        zIndex: 10,
    },
    thumbWrapper: {
        width: ITEM_WIDTH,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumb: {
        width: 30,
        height: 40,
        opacity: 0.5,
        borderRadius: 2,
    },
    activeThumb: {
        opacity: 1,
        transform: [{ scale: 1.3 }], // Make it noticeably bigger
        zIndex: 10,
    },

    toolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        zIndex: 20,
    },
    toolbarButton: {
        alignItems: 'center',
        padding: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    infoSheet: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#3A3A3C',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#38383A',
    },
    infoLabel: {
        color: '#8E8E93',
        fontSize: 16,
    },
    infoValue: {
        color: '#fff',
        fontSize: 16,
        maxWidth: '70%',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#3A3A3C',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
