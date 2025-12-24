import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Mic, MoreHorizontal, ArrowDownCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const GRID_PADDING = 12;
const GAP = 20;
const COLUMN_WIDTH = (width - (GRID_PADDING * 2) - (GAP * 2)) / 3;

const SAMPLE_ITEMS = [
    {
        id: '1',
        type: 'folder',
        name: 'Brave',
        count: 1,
        appLogo: 'https://brave.com/static-assets/images/brave-favicon.png',
    },
    {
        id: '2',
        type: 'folder',
        name: 'CamScanner',
        count: 1,
        appLogo: 'https://play-lh.googleusercontent.com/6W66vXz2G_4Q4QvXG_4Q4QvXG_4Q4QvXG_4Q4QvXG_4Q4QvXG_4Q4QvXG_4Q4QvX',
    },
    {
        id: '3',
        type: 'folder',
        name: 'Downloads',
        count: 11,
        internalIcon: <ArrowDownCircle size={32} color="rgba(255,255,255,0.7)" strokeWidth={1} />,
    },
    {
        id: '4',
        type: 'folder',
        name: 'GarageBand for iOS',
        count: 1,
        appLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/GarageBand_Icon.png/120px-GarageBand_Icon.png',
    },
    {
        id: '5',
        type: 'folder',
        name: 'Lexy Team',
        count: 186,
    },
    {
        id: '6',
        type: 'file',
        name: 'Lexy.pdf',
        date: '2024-08-10',
        size: '135 KB',
        isDoc: true,
    },
    {
        id: '7',
        type: 'file',
        name: 'Metana%20Adva...\nnced%...ure.pdf',
        date: '2025-06-24',
        size: '2.4 MB',
        thumbnail: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '8',
        type: 'folder',
        name: 'Ontario Works',
        count: 4,
    },
    {
        id: '9',
        type: 'folder',
        name: 'Reading List',
        count: 6,
    },
];

const IOSFolder = ({ appLogo, internalIcon }: { appLogo?: string, internalIcon?: any }) => (
    <View style={styles.folderWrapper}>
        <View style={styles.folderBack} />
        <View style={styles.folderFront}>
            {appLogo ? (
                <View style={styles.appIconWrapper}>
                    <Image source={{ uri: appLogo }} style={styles.appIcon} />
                </View>
            ) : internalIcon ? (
                <View style={styles.internalIconWrapper}>
                    {internalIcon}
                </View>
            ) : null}
        </View>
    </View>
);

export default function BrowseScreen() {
    const insets = useSafeAreaInsets();

    const renderItem = (item: any) => {
        return (
            <View key={item.id} style={styles.gridItem}>
                {item.type === 'folder' ? (
                    <IOSFolder />
                ) : (
                    <View style={[styles.fileWrapper, item.isDoc && styles.docFile]}>
                        {item.thumbnail ? (
                            <Image source={{ uri: item.thumbnail }} style={styles.fileImage} />
                        ) : (
                            <View style={styles.docLines}>
                                <View style={[styles.docLine, { width: '80%' }]} />
                                <View style={[styles.docLine, { width: '50%' }]} />
                                <View style={[styles.docLine, { width: '70%' }]} />
                                <View style={[styles.docLine, { width: '40%' }]} />
                            </View>
                        )}
                    </View>
                )}
                <View style={styles.labelContainer}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {item.type === 'folder' ? (
                        <Text style={styles.itemMetadata}>{item.count} item{item.count !== 1 ? 's' : ''}</Text>
                    ) : (
                        <>
                            <Text style={styles.itemMetadata}>{item.date}</Text>
                            <Text style={styles.itemMetadata}>{item.size}</Text>
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header Content */}
            <BlurView intensity={100} tint="dark" style={[styles.header, { paddingTop: insets.top + 5 }]}>
                <View style={styles.topRow}>
                    <Text style={styles.title}>Browse</Text>
                    <Pressable style={styles.moreButton}>
                        <MoreHorizontal size={18} color="#0A84FF" />
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor="#8E8E93"
                        style={styles.searchInput}
                    />
                    <Mic size={18} color="#8E8E93" style={styles.micIcon} />
                </View>
            </BlurView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {SAMPLE_ITEMS.map(renderItem)}
                </View>
            </ScrollView>

            {/* Fixed Footer */}
            <View style={[styles.footer, { bottom: insets.bottom + 65 }]}>
                <Text style={styles.footerText}>{SAMPLE_ITEMS.length} items</Text>
            </View>
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
        zIndex: 10,
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
    },
    moreButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 36,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 17,
        height: '100%',
    },
    micIcon: {
        marginLeft: 6,
    },
    scrollContent: {
        paddingHorizontal: GRID_PADDING,
        paddingTop: 180, // Increased to clear the blurred header
        paddingBottom: 150,

    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: GAP,
    },
    gridItem: {
        width: COLUMN_WIDTH,
        alignItems: 'center',
        marginBottom: 40,
    },
    // IOS Folder High Fidelity Component
    folderWrapper: {
        width: COLUMN_WIDTH * 0.85,
        height: COLUMN_WIDTH * 0.65,
        marginBottom: 8,
    },
    folderFront: {
        flex: 1,
        backgroundColor: '#78C0F0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    folderBack: {
        position: 'absolute',
        top: -5,
        left: 2,
        width: '35%',
        height: '30%',
        backgroundColor: '#78C0F0',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        zIndex: 1,
    },
    appIconWrapper: {
        width: '40%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    appIcon: {
        width: '100%',
        height: '100%',
        borderRadius: 2,
    },
    internalIconWrapper: {
        opacity: 0.9,
    },
    // File High Fidelity
    fileWrapper: {
        width: COLUMN_WIDTH * 0.7,
        height: COLUMN_WIDTH * 0.9,
        backgroundColor: '#1C1C1E',
        borderRadius: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    docFile: {
        backgroundColor: '#fff',
        padding: 6,
        justifyContent: 'center',
    },
    fileImage: {
        width: '100%',
        height: '100%',
    },
    docLines: {
        gap: 3,
    },
    docLine: {
        height: 1.5,
        backgroundColor: '#E5E5EA',
        borderRadius: 1,
    },
    // Labels
    labelContainer: {
        alignItems: 'center',
        width: '100%',
    },
    itemName: {
        color: '#fff',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 1,
        lineHeight: 16,
    },
    itemMetadata: {
        color: '#8E8E93',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 14,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: 10,
    },
    footerText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
