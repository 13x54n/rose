import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, MoreHorizontal, ChevronDown, Play, Edit2, EyeOff, Trash2, Copy, Download, Lock } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';

const { width } = Dimensions.get('window');

const MEMORY_WIDTH = width * 0.55;
const PINNED_SIZE = (width - 48) / 3;

export default function CollectionsScreen() {
    const insets = useSafeAreaInsets();

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Collections</Text>
            <View style={styles.headerIcons}>
                <Pressable style={styles.iconButton}>
                    <MoreHorizontal size={24} color="#fff" />
                </Pressable>
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }}
                        style={styles.profilePic}
                    />
                </View>
            </View>
        </View>
    );

    const renderSectionHeader = (title: string, hasEdit = false) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleLeft}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <ChevronRight size={20} color="#fff" />
            </View>
            <View style={styles.sectionTitleRight}>
                {hasEdit && (
                    <Pressable style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                )}
                <ChevronDown size={20} color="#0A84FF" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Memories Section - Empty until smart logic is added */}
                <View style={styles.section}>
                    {renderSectionHeader('Memories')}
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your memories will appear here.</Text>
                    </View>
                </View>

                {/* Albums Section - Can be expanded to show real device albums */}
                <View style={styles.section}>
                    {renderSectionHeader('Albums')}
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No albums found on device.</Text>
                    </View>
                </View>

                {/* Utilities Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Utilities')}
                    <View style={styles.utilityCard}>
                        <UtilityRow
                            icon={<EyeOff size={22} color="#8E8E93" />}
                            label="Hidden"
                            rightElement={<Lock size={16} color="#8E8E93" />}
                        />
                        <UtilityRow
                            icon={<Trash2 size={22} color="#8E8E93" />}
                            label="Recently Deleted"
                            rightElement={<Lock size={16} color="#8E8E93" />}
                            isLast
                        />
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const UtilityRow = ({ icon, label, rightElement, isLast = false }: { icon: any, label: string, rightElement: any, isLast?: boolean }) => (
    <Pressable style={styles.utilityRow}>
        <View style={styles.utilityIconContainer}>{icon}</View>
        <View style={[styles.utilityContent, !isLast && styles.utilityBorder]}>
            <Text style={styles.utilityLabel}>{label}</Text>
            {rightElement}
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        marginTop: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionTitleRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    editButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
    },
    editButtonText: {
        color: '#0A84FF',
        fontSize: 14,
        fontWeight: '600',
    },
    memoriesContainer: {
        paddingHorizontal: 20,
        gap: 15,
    },
    memoryCard: {
        width: MEMORY_WIDTH,
        height: MEMORY_WIDTH * 1.2,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    memoryImage: {
        width: '100%',
        height: '100%',
    },
    memoryOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    memoryTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    memoryDate: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    playIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinnedGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    pinnedItem: {
        width: PINNED_SIZE,
        height: PINNED_SIZE,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    pinnedImage: {
        width: '100%',
        height: '100%',
    },
    pinnedLabel: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    heartIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    horizontalAlbums: {
        paddingHorizontal: 20,
        gap: 15,
    },
    albumItem: {
        width: width * 0.35,
    },
    albumImage: {
        width: '100%',
        height: width * 0.35,
        borderRadius: 20,
    },
    albumLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
    },
    peopleContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    personCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    personImage: {
        width: '100%',
        height: '100%',
    },
    utilityCard: {
        backgroundColor: '#1C1C1E',
        marginHorizontal: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    utilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
    },
    utilityIconContainer: {
        width: 32,
        alignItems: 'center',
    },
    utilityContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 16,
        marginLeft: 12,
    },
    utilityBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#38383A',
    },
    utilityLabel: {
        fontSize: 17,
        color: '#fff',
    },
    utilityCount: {
        fontSize: 17,
        color: '#8E8E93',
    },
    emptyContainer: {
        paddingHorizontal: 20,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1C1C1E',
        borderRadius: 20,
        marginHorizontal: 20,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    },
});

