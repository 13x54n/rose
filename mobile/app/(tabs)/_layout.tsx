import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
import { Image, Layers, Search, Camera, Folder, Library } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.dark.accent,
                tabBarInactiveTintColor: Colors.dark.textSecondary,
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.dark.tabBar }]} />
                    )
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color }) => <Image size={24} color={color} strokeWidth={2} />,
                }}
            />
            <Tabs.Screen
                name="albums"
                options={{
                    title: 'Collections',
                    tabBarIcon: ({ color }) => <Library size={24} color={color} strokeWidth={2} />,
                }}
            />
            <Tabs.Screen
                name="folder"
                options={{
                    title: 'Folder',
                    tabBarIcon: ({ color }) => <Folder size={24} color={color} strokeWidth={2} />,
                }}
            />
            <Tabs.Screen
                name="camera"
                options={{
                    title: 'Camera',
                    tabBarIcon: ({ color }) => <Camera size={24} color={color} strokeWidth={2} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        height: 85,
        backgroundColor: Platform.OS === 'android' ? Colors.dark.background : 'transparent',
    },
});
