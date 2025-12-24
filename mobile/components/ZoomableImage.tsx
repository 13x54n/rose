import React from 'react';
import { StyleSheet, Dimensions, Image } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ZoomableImageProps {
    uri: string;
    onZoomChange?: (isZoomed: boolean) => void;
}

export default function ZoomableImage({ uri }: ZoomableImageProps) {
    return (
        <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});
