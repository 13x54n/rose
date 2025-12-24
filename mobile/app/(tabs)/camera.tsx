import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, Platform, ScrollView, Animated, DeviceEventEmitter } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType, FlashMode } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, Zap, ZapOff, Circle, Square, Image as ImageIcon, Sparkles, Sun } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { mediaManager } from '../../services/mediaManager';

const { width, height } = Dimensions.get('window');

type CameraMode = 'video' | 'photo' | 'portrait';

const FILTERS: { label: string; value: any }[] = [
    { label: 'NATURAL', value: 'auto' },
    { label: 'VIVID', value: 'sunny' },
    { label: 'COOL', value: 'cloudy' },
    { label: 'WARM', value: 'incandescent' },
    { label: 'MONO', value: 'shadow' },
];

export default function CameraScreen() {
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

    const [type, setType] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [mode, setMode] = useState<CameraMode>('photo');
    const [zoom, setZoom] = useState(0);
    const [filter, setFilter] = useState<any>('auto');
    const [isRecording, setIsRecording] = useState(false);
    const [lastItem, setLastItem] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [exposure, setExposure] = useState(0.5);
    const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
    const [showFocus, setShowFocus] = useState(false);
    const focusTimerRef = useRef<NodeJS.Timeout | null>(null);

    const cameraRef = useRef<CameraView>(null);
    const shutterOpacity = useRef(new Animated.Value(0)).current;

    const triggerShutterEffect = () => {
        shutterOpacity.setValue(1);
        Animated.timing(shutterOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleTapToFocus = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        setFocusPoint({ x: locationX, y: locationY });
        setShowFocus(true);

        if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
        focusTimerRef.current = setTimeout(() => {
            setShowFocus(false);
        }, 3000);
    };

    const updateExposure = (event: any) => {
        const { locationY } = event.nativeEvent;
        // Map Y position (0-120px) to exposure (0-1)
        const newExposure = Math.max(0, Math.min(1, 1 - (locationY / 120)));
        setExposure(newExposure);

        // Reset timer when sliding
        if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
        focusTimerRef.current = setTimeout(() => {
            setShowFocus(false);
        }, 3000);
    };

    useEffect(() => {
        const loadLastItem = async () => {
            if (mediaLibraryPermission?.granted) {
                try {
                    const { assets } = await MediaLibrary.getAssetsAsync({ first: 1, sortBy: ['creationTime'] });
                    if (assets.length > 0) {
                        setLastItem(assets[0].uri);
                    }
                } catch (error) {
                    console.error("Error loading last media item:", error);
                }
            }
        };
        loadLastItem();
        return () => {
            if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
        };
    }, [mediaLibraryPermission?.granted]);

    if (!permission || !micPermission || !mediaLibraryPermission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted || !micPermission.granted || !mediaLibraryPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={() => {
                    requestPermission();
                    requestMicPermission();
                    requestMediaLibraryPermission();
                }} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraType = () => setType(c => (c === 'back' ? 'front' : 'back'));
    const toggleFlash = () => setFlash(c => (c === 'off' ? 'on' : 'off'));

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            if (mode === 'photo' || mode === 'portrait') {
                const options = mode === 'portrait' ? { quality: 1 } : {};
                const photo = await cameraRef.current.takePictureAsync(options);
                triggerShutterEffect();

                if (photo) {
                    // Actual upload to backend/IPFS
                    const cloudUri = await mediaManager.uploadCapture(BACKEND_URL, photo.uri, { type: 'photo' });
                    setLastItem(cloudUri);
                    DeviceEventEmitter.emit('library-refresh');
                    console.log('[Camera] Photo registered in backend registry:', cloudUri);
                }
            } else if (mode === 'video') {
                if (isRecording) {
                    cameraRef.current.stopRecording();
                    triggerShutterEffect();
                    setIsRecording(false);
                } else {
                    setIsRecording(true);
                    const video = await cameraRef.current.recordAsync();
                    if (video) {
                        // Actual upload to backend/IPFS
                        const cloudUri = await mediaManager.uploadCapture(BACKEND_URL, video.uri, { type: 'video' });
                        setLastItem(cloudUri);
                        DeviceEventEmitter.emit('library-refresh');
                        console.log('[Camera] Video registered in backend registry:', cloudUri);
                    }
                }
            }
        } catch (error) {
            console.error("Capture error:", error);
            setIsRecording(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={type}
                    flash={flash}
                    mode={(mode === 'video' ? 'video' : 'photo') as any}
                    zoom={zoom}
                />

                <Animated.View
                    style={[
                        styles.shutterOverlay,
                        { opacity: shutterOpacity }
                    ]}
                    pointerEvents="none"
                />

                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleTapToFocus}
                >
                    {/* Focus UI */}
                    {showFocus && focusPoint && (
                        <View style={[styles.focusOverlay, { top: focusPoint.y - 40, left: focusPoint.x - 40 }]}>
                            <View style={styles.focusSquare} />

                            {/* Exposure Slider UI */}
                            <View
                                style={styles.exposureSlider}
                                onStartShouldSetResponder={() => true}
                                onResponderGrant={updateExposure}
                                onResponderMove={updateExposure}
                            >
                                <View style={styles.exposureTrack} />
                                <View style={[styles.exposureThumb, { bottom: exposure * (120 - 24) }]}>
                                    <Sun size={14} color="#FFD60A" fill="#FFD60A" />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Portrait Frame Overlay */}
                    {mode === 'portrait' && (
                        <View style={styles.portraitIndicator}>
                            <Text style={styles.portraitText}>PORTRAITS</Text>
                            <View style={styles.portraitCircle} />
                        </View>
                    )}

                    {/* Top Controls */}
                    <View style={[styles.topControls, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                            {flash === 'on' ? <Zap size={22} color="#FFD60A" fill="#FFD60A" /> : <ZapOff size={22} color="#fff" />}
                        </TouchableOpacity>
                    </View>

                    {/* Zoom Controls */}
                    <View style={styles.zoomContainer}>
                        <TouchableOpacity
                            onPress={() => setZoom(0)}
                            style={[styles.zoomButton, zoom === 0 && styles.activeZoomButton]}
                        >
                            <Text style={styles.zoomText}>1x</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setZoom(0.5)}
                            style={[styles.zoomButton, zoom === 0.5 && styles.activeZoomButton]}
                        >
                            <Text style={styles.zoomText}>2x</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filters Carousel */}
                    {showFilters && (
                        <View style={styles.filtersWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                                {FILTERS.map((f) => (
                                    <TouchableOpacity
                                        key={f.label}
                                        onPress={() => setFilter(f.value)}
                                        style={[styles.filterItem, filter === f.value && styles.activeFilterItem]}
                                    >
                                        <Text style={[styles.filterLabel, filter === f.value && styles.activeFilterLabel]}>{f.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Bottom UI */}
                    <View style={[styles.bottomContainer, { bottom: insets.bottom + 85 }]}>
                        {/* Mode Selector */}
                        <View style={styles.modeSelector}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.modeScrollContent}
                            >
                                <Pressable style={styles.modeButton} onPress={() => setMode('video')}>
                                    <Text style={[styles.modeText, mode === 'video' && styles.activeModeText]}>VIDEO</Text>
                                </Pressable>
                                <Pressable style={styles.modeButton} onPress={() => setMode('photo')}>
                                    <Text style={[styles.modeText, mode === 'photo' && styles.activeModeText]}>PHOTO</Text>
                                </Pressable>
                                <Pressable style={styles.modeButton} onPress={() => setMode('portrait')}>
                                    <Text style={[styles.modeText, mode === 'portrait' && styles.activeModeText]}>PORTRAIT</Text>
                                </Pressable>
                            </ScrollView>
                        </View>

                        {/* Main Capture Bar */}
                        <View style={styles.captureBar}>
                            <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.iconButton}>
                                <Sparkles size={24} color={showFilters ? "#FFD60A" : "#fff"} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCapture}
                                style={[
                                    styles.captureButtonOuter,
                                    mode === 'video' && styles.videoCaptureOuter
                                ]}
                            >
                                <View style={[
                                    styles.captureButtonInner,
                                    mode === 'video' && styles.videoCaptureInner,
                                    isRecording && styles.recordingInner,
                                ]} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                                <RotateCcw size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraContainer: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    permissionText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#0A84FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    topControls: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomContainer: {
        position: 'absolute',
        bottom: 260,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 20,
    },
    focusOverlay: {
        position: 'absolute',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusSquare: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#FFD60A',
    },
    exposureSlider: {
        position: 'absolute',
        right: 0,
        top: 5,
        width: 30,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exposureTrack: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,214,10,0.5)',
    },
    exposureThumb: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,214,10,0.3)',
    },
    zoomButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeZoomButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    zoomText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    filtersWrapper: {
        position: 'absolute',
        bottom: 320,
        width: '100%',
    },
    filtersScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterItem: {
        borderColor: '#FFD60A',
        backgroundColor: 'rgba(255,214,10,0.2)',
    },
    filterLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    activeFilterLabel: {
        color: '#FFD60A',
    },
    portraitIndicator: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: -100,
    },
    portraitText: {
        color: '#FFD60A',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        letterSpacing: 1,
    },
    portraitCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: '#FFD60A',
        borderStyle: 'dashed',
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    modeSelector: {
        height: 40,
        marginBottom: 20,
    },
    modeScrollContent: {
        alignItems: 'center',
    },
    modeButton: {
        width: 80,
        alignItems: 'center',
    },
    modeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
    },
    activeModeText: {
        color: '#FFD60A',
    },
    captureBar: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    galleryPreview: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'transparent',
    },
    captureButtonOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoCaptureOuter: {
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    videoCaptureInner: {
        backgroundColor: '#FF3B30',
    },
    portraitCaptureInner: {
        backgroundColor: '#FFD60A',
    },
    recordingInner: {
        width: 28,
        height: 28,
        borderRadius: 4,
    },
    shutterOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        zIndex: 999,
    },
});
