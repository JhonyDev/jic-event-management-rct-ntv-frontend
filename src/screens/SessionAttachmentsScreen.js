import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
  Dimensions,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import {
  FileIcon,
  DocumentIcon,
  VideoIcon,
  ImageIcon,
  DownloadIcon,
  PaperclipIcon,
  CloseIcon,
  EyeIcon,
} from "../components/SvgIcons";
import eventService from "../services/eventService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SessionAttachmentsScreen = ({ navigation }) => {
  const route = useRoute();
  const theme = useTheme();
  const { sessionId, sessionTitle, eventId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [sessionId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      // Fetch session attachments
      const response = await eventService.getSessionAttachments(sessionId);
      console.log("Session attachments response:", response);
      setAttachments(response || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      Alert.alert("Error", "Failed to load attachments. Please try again.");
      setAttachments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttachments();
  };

  const getFileIcon = (fileType, extension) => {
    const ext = extension?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
      return <ImageIcon size={24} color={theme.colors.primary} />;
    }
    if (["mp4", "avi", "mov", "webm"].includes(ext)) {
      return <VideoIcon size={24} color={theme.colors.primary} />;
    }
    if (["pdf"].includes(ext)) {
      return <DocumentIcon size={24} color={theme.colors.error} />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <DocumentIcon size={24} color={theme.colors.primary} />;
    }
    if (["ppt", "pptx"].includes(ext)) {
      return <FileIcon size={24} color={theme.colors.tertiary} />;
    }

    // Default file icon
    return <FileIcon size={24} color={theme.colors.onSurfaceVariant} />;
  };

  const getMaterialTypeLabel = (type) => {
    const labels = {
      slides: "Presentation Slides",
      poster: "Poster/Banner",
      demo: "Demo Information",
      handout: "Handout/Brochure",
      video: "Video Content",
      document: "Document",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getFullUrl = (attachment) => {
    const fileUrl = attachment.file_url || attachment.file;
    if (!fileUrl) return null;

    return fileUrl.startsWith("http")
      ? fileUrl
      : `${eventService.getBaseURL()}${fileUrl}`;
  };

  const handleViewAttachment = (attachment) => {
    const fullUrl = getFullUrl(attachment);
    if (!fullUrl) {
      Alert.alert("Error", "File URL not available");
      return;
    }

    setSelectedAttachment({ ...attachment, fullUrl });
    setModalVisible(true);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "This app needs access to your storage to download files",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleDownloadAttachment = async (attachment) => {
    const fullUrl = getFullUrl(attachment);
    if (!fullUrl) {
      Alert.alert("Error", "File URL not available");
      return;
    }

    setDownloading(true);

    try {
      // Open the URL in browser for download
      const supported = await Linking.canOpenURL(fullUrl);

      if (supported) {
        await Linking.openURL(fullUrl);

        Alert.alert(
          "Download Started",
          "The file will be downloaded in your browser. Check your Downloads folder.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          "Cannot open download URL. Please try again later."
        );
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Download Failed",
        "Unable to download the file. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  const isImageFile = (extension) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    return imageExtensions.includes(extension?.toLowerCase());
  };

  const isPdfFile = (extension) => {
    return extension?.toLowerCase() === "pdf";
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#121212" }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BB86FC" />
          <Text style={[styles.loadingText, { color: "#B3B3B3" }]}>
            Loading attachments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#121212" }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#BB86FC"]}
            tintColor="#BB86FC"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: "#2C2C2C" }]}>
            <PaperclipIcon size={32} color="#BB86FC" />
          </View>
          <Text style={[styles.sessionTitle, { color: "#FFFFFF" }]}>
            {sessionTitle || "Session Attachments"}
          </Text>
          <Text style={[styles.sessionSubtitle, { color: "#B3B3B3" }]}>
            Supporting Materials
          </Text>
        </View>

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <View style={styles.attachmentsList}>
            {attachments.map((attachment, index) => (
              <View
                key={attachment.id || index}
                style={[styles.attachmentCard, { backgroundColor: "#1E1E1E" }]}
              >
                <View style={styles.attachmentContent}>
                  <View
                    style={[
                      styles.fileIconContainer,
                      { backgroundColor: "#2C2C2C" },
                    ]}
                  >
                    {getFileIcon(
                      attachment.material_type,
                      attachment.file_extension
                    )}
                  </View>

                  <View style={styles.attachmentInfo}>
                    <Text
                      style={[styles.attachmentTitle, { color: "#FFFFFF" }]}
                    >
                      {attachment.title}
                    </Text>

                    {attachment.description && (
                      <Text
                        style={[
                          styles.attachmentDescription,
                          { color: "#B3B3B3" },
                        ]}
                        numberOfLines={2}
                      >
                        {attachment.description}
                      </Text>
                    )}

                    <View style={styles.attachmentMeta}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: "#3A3A3A" },
                        ]}
                      >
                        <Text
                          style={[styles.typeBadgeText, { color: "#BB86FC" }]}
                        >
                          {getMaterialTypeLabel(attachment.material_type)}
                        </Text>
                      </View>

                      {attachment.file_extension && (
                        <Text
                          style={[styles.fileExtension, { color: "#B3B3B3" }]}
                        >
                          .{attachment.file_extension.toUpperCase()}
                        </Text>
                      )}
                    </View>

                    {/* Buttons Container */}
                    <View style={styles.buttonsContainer}>
                      {/* View Button */}
                      <TouchableOpacity
                        style={[
                          styles.viewButton,
                          { backgroundColor: "#4CAF50" },
                        ]}
                        onPress={() => handleViewAttachment(attachment)}
                        activeOpacity={0.7}
                      >
                        <EyeIcon size={16} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                          View
                        </Text>
                      </TouchableOpacity>

                      {/* Download Button */}
                      <TouchableOpacity
                        style={[
                          styles.downloadButton,
                          { backgroundColor: "#2196F3" },
                        ]}
                        onPress={() => handleDownloadAttachment(attachment)}
                        activeOpacity={0.7}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <DownloadIcon size={16} color="#FFFFFF" />
                            <Text
                              style={[styles.buttonText, { color: "#FFFFFF" }]}
                            >
                              Download
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: "#2C2C2C" },
              ]}
            >
              <PaperclipIcon size={48} color="#B3B3B3" />
            </View>
            <Text style={[styles.emptyTitle, { color: "#FFFFFF" }]}>
              No Attachments Available
            </Text>
            <Text style={[styles.emptyDescription, { color: "#B3B3B3" }]}>
              No supporting materials have been uploaded for this session yet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Attachment View Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: "#121212" }]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: "#1E1E1E", borderBottomColor: "#3A3A3A" },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: "#FFFFFF" }]}
              numberOfLines={1}
            >
              {selectedAttachment?.title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <CloseIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            {selectedAttachment && (
              <>
                {isImageFile(selectedAttachment.file_extension) ? (
                  <ScrollView
                    contentContainerStyle={styles.imageScrollContainer}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    pinchGestureEnabled={true}
                  >
                    <Image
                      source={{ uri: selectedAttachment.fullUrl }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </ScrollView>
                ) : (
                  <View style={styles.unsupportedContainer}>
                    {isPdfFile(selectedAttachment.file_extension) ? (
                      <DocumentIcon size={64} color="#FF6B6B" />
                    ) : selectedAttachment.file_extension === "doc" ||
                      selectedAttachment.file_extension === "docx" ? (
                      <DocumentIcon size={64} color="#BB86FC" />
                    ) : (
                      <FileIcon size={64} color="#B3B3B3" />
                    )}

                    <Text
                      style={[styles.unsupportedText, { color: "#FFFFFF" }]}
                    >
                      {selectedAttachment.title}
                    </Text>
                    <Text
                      style={[styles.unsupportedSubtext, { color: "#B3B3B3" }]}
                    >
                      {selectedAttachment.file_extension?.toUpperCase()} File
                    </Text>

                    {selectedAttachment.description && (
                      <Text
                        style={[styles.fileDescription, { color: "#B3B3B3" }]}
                      >
                        {selectedAttachment.description}
                      </Text>
                    )}

                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.modalActionButton,
                          { backgroundColor: "#4CAF50" },
                        ]}
                        onPress={() => {
                          setModalVisible(false);
                          Linking.openURL(selectedAttachment.fullUrl);
                        }}
                        activeOpacity={0.7}
                      >
                        <EyeIcon size={20} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                          Open in Browser
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modalActionButton,
                          { backgroundColor: "#2196F3" },
                        ]}
                        onPress={() => {
                          setModalVisible(false);
                          handleDownloadAttachment(selectedAttachment);
                        }}
                        activeOpacity={0.7}
                      >
                        <DownloadIcon size={20} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                          Download
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  sessionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  sessionSubtitle: {
    fontSize: 14,
  },

  attachmentsList: {
    paddingHorizontal: 16,
  },

  attachmentCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  attachmentContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  attachmentInfo: {
    flex: 1,
    marginRight: 8,
  },

  attachmentTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },

  attachmentDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },

  attachmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  typeBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },

  fileExtension: {
    fontSize: 12,
    fontWeight: "600",
  },

  downloadIconContainer: {
    padding: 8,
  },

  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minWidth: 100,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },

  closeButton: {
    padding: 8,
  },

  modalContent: {
    flex: 1,
  },

  modalImage: {
    width: screenWidth,
    height: screenHeight - 100,
  },

  imageScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  unsupportedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  unsupportedText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },

  unsupportedSubtext: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },

  fileDescription: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
});

export default SessionAttachmentsScreen;
