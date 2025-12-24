import { View, Text, StyleSheet, Image, Pressable, Dimensions, FlatList, Alert, DeviceEventEmitter } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal, Share, Heart, Info, Sliders, Trash } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useState, useEffect, useRef } from 'react';
import { FileService, IPFSFile } from '../services/FileService';
import ZoomableImage from '../components/ZoomableImage';

const { width } = Dimensions.get('window');
const THUMB_SIZE = 40;
const THUMB_GAP = 4;
const ITEM_WIDTH = THUMB_SIZE + THUMB_GAP;

export default function PhotoViewer() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // State
    const [photos, setPhotos] = useState<IPFSFile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhoto, setCurrentPhoto] = useState<IPFSFile | null>(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

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
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        const data = await FileService.getAllPhotos();
        setPhotos(data);

        // Find initial index
        const index = data.findIndex(p => p.id === initialId);
        if (index !== -1) {
            setCurrentIndex(index);
            setCurrentPhoto(data[index]);
            // Needs a slight delay to scroll after layout
            setTimeout(() => {
                mainListRef.current?.scrollToIndex({ index, animated: false });
                scrubberListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
            }, 100);
        } else if (data.length > 0) {
            setCurrentPhoto(data[0]);
        }
    };

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

    const displayDate = currentPhoto ? currentPhoto.date : initialDate;

    // Render Items
    const renderMainItem = ({ item }: { item: IPFSFile }) => (
        <View style={styles.imageWrapper}>
            <ZoomableImage
                uri={item.uri || ''}
                onZoomChange={(isZoomed) => setScrollEnabled(!isZoomed)}
            />
        </View>
    );

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
            <BlurView intensity={30} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <ChevronLeft size={28} color="#0A84FF" />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerDate}>{displayDate}</Text>
                        <Text style={styles.headerTime}>16:17</Text>
                    </View>
                    <Pressable style={styles.menuButton}>
                        <MoreHorizontal size={24} color="#0A84FF" />
                    </Pressable>
                </View>
            </BlurView>

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
            <View style={styles.scrubberContainer}>
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

            {/* Bottom Toolbar */}
            <BlurView intensity={80} tint="dark" style={[styles.toolbar, { paddingBottom: insets.bottom }]}>
                <Pressable style={styles.toolbarButton}><Share size={24} color="#0A84FF" /></Pressable>
                <Pressable style={styles.toolbarButton}><Heart size={24} color="#0A84FF" /></Pressable>
                <Pressable style={styles.toolbarButton}><Info size={24} color="#0A84FF" /></Pressable>
                <Pressable style={styles.toolbarButton}><Sliders size={24} color="#0A84FF" /></Pressable>
                <Pressable style={styles.toolbarButton} onPress={handleDelete}><Trash size={24} color="#0A84FF" /></Pressable>
            </BlurView>
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
});
