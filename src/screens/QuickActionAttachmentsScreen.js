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
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import {
  FileIcon,
  DocumentIcon,
  VideoIcon,
  ImageIcon,
  DownloadIcon,
  PaperclipIcon,
  CloseIcon,
  EyeIcon,
  FileTextIcon,
  PlayCircleIcon,
  PresentationIcon,
  FolderIcon,
  BoxIcon,
  GridIcon,
} from "../components/SvgIcons";
import eventService from "../services/eventService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QuickActionAttachmentsScreen = ({ navigation }) => {
  const route = useRoute();
  const { theme } = useTheme();
  const { quickActionId, quickActionTitle, supportingMaterials, eventId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingFiles, setDownloadingFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState({});
  const [loadingGalleries, setLoadingGalleries] = useState({});
  const [videoPaused, setVideoPaused] = useState(true); // Changed to true to prevent autoplay
  const [currentGalleryFiles, setCurrentGalleryFiles] = useState([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentGalleryTitle, setCurrentGalleryTitle] = useState('');
  const [videoRefs, setVideoRefs] = useState([]);

  useEffect(() => {
    fetchAttachments();
  }, [quickActionId, supportingMaterials]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);

      // If supporting materials were passed directly, use them
      if (supportingMaterials && supportingMaterials.length > 0) {
        console.log("Using passed supporting materials:", supportingMaterials);
        setAttachments(supportingMaterials);

        // Check for gallery type materials and fetch their files
        for (const material of supportingMaterials) {
          if (material.material_type === 'gallery' && eventId) {
            fetchGalleryFiles(material.id);
          }
        }
      } else if (quickActionId) {
        // Otherwise, fetch from API
        const response = await eventService.getQuickActionAttachments(quickActionId);
        console.log("Quick action attachments response:", response);
        setAttachments(response || []);

        // Check for gallery type materials and fetch their files
        for (const material of (response || [])) {
          if (material.material_type === 'gallery' && eventId) {
            fetchGalleryFiles(material.id);
          }
        }
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      Alert.alert("Error", "Failed to load attachments. Please try again.");
      setAttachments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGalleryFiles = async (materialId) => {
    try {
      console.log("Fetching gallery files for material:", materialId);
      setLoadingGalleries(prev => ({ ...prev, [materialId]: true }));

      // Use the new API endpoint that works with token authentication
      const response = await eventService.getSupportingMaterialGallery(materialId);
      console.log("Gallery response:", response);

      if (response && response.gallery_files) {
        setGalleryFiles(prev => ({ ...prev, [materialId]: response.gallery_files }));
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setGalleryFiles(prev => ({ ...prev, [materialId]: response }));
      }
    } catch (error) {
      console.error("Error fetching gallery files:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoadingGalleries(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttachments();
  };

  const getFileIcon = (fileType, extension) => {
    const ext = extension?.toLowerCase();

    if (fileType === 'gallery') {
      return <GridIcon size={24} color={theme.colors.primary} />;
    }
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
      gallery: "Media Gallery",
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
    if (attachment.material_type === 'gallery') {
      // For gallery, show the gallery grid (already shown inline)
      return;
    }

    const fullUrl = getFullUrl(attachment);
    if (!fullUrl) {
      Alert.alert("Error", "File URL not available");
      return;
    }

    setSelectedAttachment({ ...attachment, fullUrl });
    setModalVisible(true);
  };

  const handleGalleryItemPress = (item, galleryTitle, allFiles, itemIndex) => {
    // Process all gallery files to add necessary properties
    const processedFiles = allFiles.map((file) => {
      const fullUrl = file.file_url?.startsWith("http")
        ? file.file_url
        : `${eventService.getBaseURL()}${file.file_url}`;
      const extension = getFileExtension(file.file_url);
      const isImage = isImageFile(extension);
      const isVideo = isVideoFile(extension);

      return {
        ...file,
        fullUrl,
        extension,
        isImage,
        isVideo,
        galleryTitle
      };
    });

    setCurrentGalleryFiles(processedFiles);
    setCurrentGalleryIndex(itemIndex);
    setCurrentGalleryTitle(galleryTitle);
    setSelectedGalleryItem(processedFiles[itemIndex]);
    setGalleryModalVisible(true);
    setVideoPaused(true); // Start with video paused
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant media library permissions to save files to your gallery.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleDownloadSingleGalleryFile = async (file, galleryTitle) => {
    setDownloading(true);
    setDownloadModalVisible(true);
    setDownloadMessage("Preparing download...");
    setDownloadProgress(0);
    setTotalFiles(0); // Single file, no counter display

    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to save files to your gallery.');
        setDownloading(false);
        setDownloadModalVisible(false);
        return;
      }

      const fullUrl = file.fullUrl || file.file_url;
      const url = fullUrl?.startsWith("http")
        ? fullUrl
        : `${eventService.getBaseURL()}${fullUrl}`;

      // Get file extension
      const urlParts = url.split('.');
      const extension = urlParts[urlParts.length - 1]?.toLowerCase() || 'jpg';

      setDownloadMessage("Downloading file...");

      // Create temp directory for download
      const tempDir = FileSystem.cacheDirectory + 'temp_downloads/';
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      }

      // Create temp filename with gallery title
      const timestamp = Date.now();
      const filename = `JIC_${galleryTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${extension}`;
      const tempFileUri = tempDir + filename;

      // Download the file to temp location with progress callback
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        tempFileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(Math.round(progress * 100));
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();

      if (downloadResult && downloadResult.status === 200) {
        setDownloadMessage("Saving to gallery...");
        setDownloadProgress(100);

        // Save to media library (public gallery)
        try {
          await MediaLibrary.createAssetAsync(downloadResult.uri);
          setDownloadModalVisible(false);
          Alert.alert(
            "Success",
            `File saved to your gallery`,
            [{ text: "OK" }]
          );
          // Clean up temp file
          await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
        } catch (mediaError) {
          console.error("Error saving to gallery:", mediaError);
          setDownloadModalVisible(false);
          Alert.alert("Error", "Failed to save file to gallery");
        }
      } else {
        setDownloadModalVisible(false);
        Alert.alert("Error", "Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      setDownloadModalVisible(false);
      Alert.alert(
        "Download Failed",
        "Unable to download the file. Please try again."
      );
    } finally {
      setDownloading(false);
      setDownloadModalVisible(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadAllGalleryFiles = async (files, galleryTitle) => {
    if (!files || files.length === 0) {
      Alert.alert("Error", "No files to download");
      return;
    }

    Alert.alert(
      "Download All",
      `Download ${files.length} files from "${galleryTitle}" to your gallery?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Download All",
          onPress: async () => {
            setDownloading(true);
            setDownloadingAll(true);
            setDownloadModalVisible(true);
            setDownloadMessage("Preparing downloads...");
            setTotalFiles(files.length);
            setDownloadingFiles(0);
            setDownloadProgress(0);

            let downloadCount = 0;
            let failedCount = 0;

            try {
              // Request media library permissions once
              const { status } = await MediaLibrary.requestPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission required', 'Please grant permission to save files to your gallery.');
                setDownloading(false);
                setDownloadingAll(false);
                setDownloadModalVisible(false);
                return;
              }

              setDownloadMessage(`Downloading ${files.length} files...`);

              // Create temp directory for downloads
              const tempDir = FileSystem.cacheDirectory + 'temp_downloads/';
              const dirInfo = await FileSystem.getInfoAsync(tempDir);
              if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
              }

              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setDownloadingFiles(i + 1);
                setDownloadProgress(((i + 1) / files.length) * 100);

                try {
                  const fullUrl = file.file_url?.startsWith("http")
                    ? file.file_url
                    : `${eventService.getBaseURL()}${file.file_url}`;

                  // Get file extension
                  const urlParts = fullUrl.split('.');
                  const extension = urlParts[urlParts.length - 1]?.toLowerCase() || 'jpg';

                  // Create temp filename
                  const filename = `JIC_${galleryTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${i + 1}.${extension}`;
                  const tempFileUri = tempDir + filename;

                  // Download the file to temp location with progress tracking
                  const downloadResult = await FileSystem.downloadAsync(
                    fullUrl,
                    tempFileUri,
                    {
                      md5: false,
                      cache: true,
                    }
                  );

                  if (downloadResult.status === 200) {
                    setDownloadMessage(`Saving to gallery...`);
                    // Save to media library (public gallery)
                    try {
                      await MediaLibrary.createAssetAsync(downloadResult.uri);
                      downloadCount++;
                      // Clean up temp file
                      await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
                    } catch (mediaError) {
                      console.error("Error saving to gallery:", mediaError);
                      failedCount++;
                    }
                  } else {
                    failedCount++;
                  }
                } catch (error) {
                  console.error("Error downloading file:", error);
                  failedCount++;
                }
              }

              // Clean up temp directory
              await FileSystem.deleteAsync(tempDir, { idempotent: true });

            } catch (error) {
              console.error("Error in download process:", error);
              Alert.alert("Error", "Failed to download files");
            } finally {
              setDownloading(false);
              setDownloadingAll(false);
              setDownloadModalVisible(false);
              setDownloadProgress(0);
            }

            if (downloadCount > 0 && failedCount === 0) {
              Alert.alert(
                "Success",
                `All ${downloadCount} files have been saved to your gallery.`
              );
            } else if (downloadCount > 0 && failedCount > 0) {
              Alert.alert(
                "Partial Success",
                `${downloadCount} files saved, ${failedCount} files failed.`
              );
            } else if (downloadCount === 0 && failedCount > 0) {
              Alert.alert("Error", "Failed to download files");
            }
          }
        }
      ]
    );
  };

  const handleDownloadAttachment = async (attachment) => {
    const fullUrl = getFullUrl(attachment);
    if (!fullUrl) {
      Alert.alert("Error", "File URL not available");
      return;
    }

    // Check if it's an image or video file
    const extension = attachment.file_extension?.toLowerCase();
    const isMediaFile = isImageFile(extension) || isVideoFile(extension);

    if (isMediaFile) {
      setDownloading(true);
      setDownloadModalVisible(true);
      setDownloadMessage(`Downloading ${attachment.title}...`);
      setDownloadProgress(0);
      setTotalFiles(0);

      try {
        // Request media library permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please grant permission to save files to your gallery.');
          setDownloading(false);
          setDownloadModalVisible(false);
          return;
        }

        // Create temp directory for download
        const tempDir = FileSystem.cacheDirectory + 'temp_downloads/';
        const dirInfo = await FileSystem.getInfoAsync(tempDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        }

        // Create temp filename
        const timestamp = Date.now();
        const filename = `JIC_${attachment.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${extension}`;
        const tempFileUri = tempDir + filename;

        // Download the file to temp location with progress
        const downloadResumable = FileSystem.createDownloadResumable(
          fullUrl,
          tempFileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            setDownloadProgress(Math.round(progress * 100));
          }
        );

        const downloadResult = await downloadResumable.downloadAsync();

        if (downloadResult && downloadResult.status === 200) {
          setDownloadMessage("Saving to gallery...");
          setDownloadProgress(100);

          // Save to media library (public gallery)
          try {
            await MediaLibrary.createAssetAsync(downloadResult.uri);
            setDownloadModalVisible(false);
            Alert.alert(
              "Success",
              `${attachment.title} has been saved to your gallery.`,
              [{ text: "OK" }]
            );
            // Clean up temp file
            await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
          } catch (mediaError) {
            console.error("Error saving to gallery:", mediaError);
            setDownloadModalVisible(false);
            Alert.alert("Error", "Failed to save file to gallery");
          }
        } else {
          setDownloadModalVisible(false);
          Alert.alert("Error", "Failed to download file");
        }
      } catch (error) {
        console.error("Download error:", error);
        setDownloadModalVisible(false);
        Alert.alert(
          "Download Failed",
          "Unable to download the file. Please try again."
        );
      } finally {
        setDownloading(false);
        setDownloadModalVisible(false);
        setDownloadProgress(0);
      }
    } else {
      // For non-media files (PDF, documents, etc.), open in browser as before
      setDownloading(true);

      try {
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
    }
  };

  const isImageFile = (extension) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    return imageExtensions.includes(extension?.toLowerCase());
  };

  const isVideoFile = (extension) => {
    const videoExtensions = ["mp4", "avi", "mov", "webm", "mkv"];
    return videoExtensions.includes(extension?.toLowerCase());
  };

  const isPdfFile = (extension) => {
    return extension?.toLowerCase() === "pdf";
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    const parts = url.split('.');
    return parts[parts.length - 1]?.toLowerCase() || '';
  };

  const renderGalleryItem = ({ item, index }, galleryTitle, allFiles) => {
    const fullUrl = item.file_url?.startsWith("http")
      ? item.file_url
      : `${eventService.getBaseURL()}${item.file_url}`;

    const extension = getFileExtension(item.file_url);
    const isImage = isImageFile(extension);
    const isVideo = isVideoFile(extension);

    // Apply right margin except for the last item in each row (every 3rd item)
    const isLastInRow = (index + 1) % 3 === 0;
    const itemStyle = [
      styles.galleryItem,
      {
        backgroundColor: theme.colors.surface,
        marginRight: isLastInRow ? 0 : 4  // 4px gap between columns
      }
    ];

    return (
      <TouchableOpacity
        style={itemStyle}
        onPress={() => handleGalleryItemPress({ ...item, fullUrl, extension, isImage, isVideo }, galleryTitle, allFiles, index)}
        activeOpacity={0.8}
      >
        {isImage ? (
          <Image
            source={{ uri: fullUrl }}
            style={styles.galleryThumbnail}
            resizeMode="cover"
          />
        ) : isVideo ? (
          <View style={styles.videoThumbnailContainer}>
            <Video
              source={{ uri: fullUrl }}
              style={styles.galleryThumbnail}
              shouldPlay={false}
              useNativeControls={false}
              resizeMode="cover"
              isLooping={false}
              positionMillis={100}
              isMuted={true}
            />
            <View style={styles.videoPlayOverlay}>
              <PlayCircleIcon size={32} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          <View style={styles.galleryThumbnail}>
            <FileIcon size={32} color={theme.colors.onSurfaceVariant} />
          </View>
        )}
        {item.caption && (
          <Text
            style={[styles.galleryItemCaption, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {item.caption}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderGalleryGrid = (attachment) => {
    const files = galleryFiles[attachment.id] || [];
    const isLoading = loadingGalleries[attachment.id];

    if (isLoading) {
      return (
        <View style={styles.galleryLoadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.galleryLoadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading gallery...
          </Text>
        </View>
      );
    }

    if (files.length === 0) {
      return (
        <View style={styles.galleryEmptyContainer}>
          <Text style={[styles.galleryEmptyText, { color: theme.colors.onSurfaceVariant }]}>
            No media files in this gallery
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={files}
        renderItem={(props) => renderGalleryItem(props, attachment.title)}
        keyExtractor={(item, index) => `${attachment.id}-${index}`}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.galleryGrid}
        columnWrapperStyle={styles.galleryRow}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading attachments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <PaperclipIcon size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.quickActionTitle, { color: theme.colors.onBackground }]}>
            {quickActionTitle || "Quick Action Attachments"}
          </Text>
          <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Supporting Materials
          </Text>
        </View>

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <View style={styles.attachmentsList}>
            {attachments.map((attachment, index) => {
              // For gallery type, show files directly without container
              if (attachment.material_type === 'gallery') {
                const files = galleryFiles[attachment.id] || [];
                const isLoading = loadingGalleries[attachment.id];

                if (isLoading) {
                  return (
                    <View key={attachment.id || index} style={styles.gallerySection}>
                      <Text style={[styles.gallerySectionTitle, { color: theme.colors.onBackground }]}>
                        {attachment.title}
                      </Text>
                      <View style={styles.galleryLoadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={[styles.galleryLoadingText, { color: theme.colors.onSurfaceVariant }]}>
                          Loading gallery...
                        </Text>
                      </View>
                    </View>
                  );
                }

                if (files.length === 0) {
                  return (
                    <View key={attachment.id || index} style={styles.gallerySection}>
                      <Text style={[styles.gallerySectionTitle, { color: theme.colors.onBackground }]}>
                        {attachment.title}
                      </Text>
                      <View style={styles.galleryEmptyContainer}>
                        <Text style={[styles.galleryEmptyText, { color: theme.colors.onSurfaceVariant }]}>
                          No media files in this gallery
                        </Text>
                      </View>
                    </View>
                  );
                }

                // Render gallery files directly
                return (
                  <View key={attachment.id || index} style={styles.gallerySection}>
                    <View style={styles.gallerySectionHeader}>
                      <View style={styles.gallerySectionTitleContainer}>
                        <Text style={[styles.gallerySectionTitle, { color: theme.colors.onBackground }]}>
                          {attachment.title}
                        </Text>
                        {attachment.description && (
                          <Text style={[styles.gallerySectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                            {attachment.description}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.downloadAllButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => handleDownloadAllGalleryFiles(files, attachment.title)}
                        activeOpacity={0.7}
                      >
                        <DownloadIcon size={16} color="#FFFFFF" />
                        <Text style={styles.downloadAllButtonText}>Download All</Text>
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={files}
                      renderItem={(props) => renderGalleryItem(props, attachment.title, files)}
                      keyExtractor={(item, fileIndex) => `${attachment.id}-${fileIndex}`}
                      numColumns={3}
                      scrollEnabled={false}
                      contentContainerStyle={styles.galleryGrid}
                      columnWrapperStyle={styles.galleryRow}
                    />
                  </View>
                );
              }

              // Regular attachment card for non-gallery items
              return (
                <View
                  key={attachment.id || index}
                  style={[styles.attachmentCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
                >
                  <View style={styles.attachmentContent}>
                    <View
                      style={[
                        styles.fileIconContainer,
                        { backgroundColor: theme.colors.background },
                      ]}
                    >
                      {getFileIcon(
                        attachment.material_type,
                        attachment.file_extension
                      )}
                    </View>

                    <View style={styles.attachmentInfo}>
                      <Text
                        style={[styles.attachmentTitle, { color: theme.colors.onSurface }]}
                      >
                        {attachment.title}
                      </Text>

                      {attachment.description && (
                        <Text
                          style={[
                            styles.attachmentDescription,
                            { color: theme.colors.onSurfaceVariant },
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
                            { backgroundColor: theme.colors.surfaceVariant },
                          ]}
                        >
                          <Text
                            style={[styles.typeBadgeText, { color: theme.colors.primary }]}
                          >
                            {getMaterialTypeLabel(attachment.material_type)}
                          </Text>
                        </View>

                        {attachment.file_extension && (
                          <Text
                            style={[styles.fileExtension, { color: theme.colors.onSurfaceVariant }]}
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
                            { backgroundColor: theme.colors.primary },
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
                            { backgroundColor: theme.colors.secondary },
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
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <PaperclipIcon size={48} color={theme.colors.onSurfaceVariant} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
              No Attachments Available
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
              No supporting materials have been uploaded for this quick action yet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Attachment View Modal (for regular files) */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {selectedAttachment?.title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <CloseIcon size={24} color={theme.colors.onSurface} />
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
                      <DocumentIcon size={64} color={theme.colors.error} />
                    ) : selectedAttachment.file_extension === "doc" ||
                      selectedAttachment.file_extension === "docx" ? (
                      <DocumentIcon size={64} color={theme.colors.primary} />
                    ) : (
                      <FileIcon size={64} color={theme.colors.onSurfaceVariant} />
                    )}

                    <Text
                      style={[styles.unsupportedText, { color: theme.colors.onBackground }]}
                    >
                      {selectedAttachment.title}
                    </Text>
                    <Text
                      style={[styles.unsupportedSubtext, { color: theme.colors.onSurfaceVariant }]}
                    >
                      {selectedAttachment.file_extension?.toUpperCase()} File
                    </Text>

                    {selectedAttachment.description && (
                      <Text
                        style={[styles.fileDescription, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {selectedAttachment.description}
                      </Text>
                    )}

                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.modalActionButton,
                          { backgroundColor: theme.colors.primary },
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
                          { backgroundColor: theme.colors.secondary },
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

      {/* Gallery Item Preview Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={galleryModalVisible}
        onRequestClose={() => {
          setGalleryModalVisible(false);
          setVideoPaused(true);
        }}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: '#000000' }]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.galleryModalHeader,
              { backgroundColor: 'rgba(0,0,0,0.8)' },
            ]}
          >
            <View style={styles.galleryHeaderContent}>
              <Text
                style={[styles.modalTitle, { color: '#FFFFFF' }]}
                numberOfLines={1}
              >
                {currentGalleryTitle || 'Gallery'}
              </Text>
              <Text style={[styles.galleryCounter, { color: '#FFFFFF' }]}>
                {currentGalleryIndex + 1} / {currentGalleryFiles.length}
              </Text>
            </View>
            <View style={styles.galleryHeaderButtons}>
              <TouchableOpacity
                style={[styles.closeButton, { marginRight: 8 }]}
                onPress={async () => {
                  const currentFile = currentGalleryFiles[currentGalleryIndex];
                  if (currentFile) {
                    await handleDownloadSingleGalleryFile(currentFile, currentGalleryTitle);
                  }
                }}
                activeOpacity={0.7}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <DownloadIcon size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setGalleryModalVisible(false);
                  setVideoPaused(true);
                }}
                activeOpacity={0.7}
              >
                <CloseIcon size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gallery Preview Content with Swipe Navigation */}
          <FlatList
            data={currentGalleryFiles}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentGalleryIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentGalleryIndex(newIndex);
              setSelectedGalleryItem(currentGalleryFiles[newIndex]);
              setVideoPaused(true); // Always pause videos when swiping
            }}
            renderItem={({ item, index }) => (
              <View style={styles.gallerySlide}>
                {item.isImage ? (
                  <ScrollView
                    contentContainerStyle={styles.imageScrollContainer}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    pinchGestureEnabled={true}
                  >
                    <Image
                      source={{ uri: item.fullUrl }}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  </ScrollView>
                ) : item.isVideo ? (
                  <TouchableOpacity
                    style={styles.videoContainer}
                    activeOpacity={1}
                    onPress={() => setVideoPaused(!videoPaused)}
                  >
                    <Video
                      source={{ uri: item.fullUrl }}
                      style={styles.fullScreenVideo}
                      shouldPlay={!videoPaused && index === currentGalleryIndex}
                      useNativeControls={true}
                      resizeMode="contain"
                      isLooping={false}
                      onError={(error) => {
                        console.error("Video error:", error);
                        Alert.alert("Error", "Unable to play video");
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.unsupportedContainer}>
                    <FileIcon size={64} color="#FFFFFF" />
                    <Text style={[styles.unsupportedText, { color: '#FFFFFF' }]}>
                      Unsupported file type
                    </Text>
                  </View>
                )}

                {item.caption && (
                  <View style={styles.captionContainer}>
                    <Text style={styles.captionText}>
                      {item.caption}
                    </Text>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item, index) => `gallery-preview-${index}`}
          />
        </SafeAreaView>
      </Modal>

      {/* Download Progress Modal */}
      <Modal
        visible={downloadModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.downloadModalOverlay}>
          <View style={[styles.downloadModalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.downloadModalHeader}>
              <DownloadIcon size={32} color={theme.colors.primary} />
              <Text style={[styles.downloadModalTitle, { color: theme.colors.onSurface }]}>
                {downloadMessage || "Downloading..."}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${downloadProgress}%`
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                {totalFiles > 0
                  ? `${downloadingFiles} of ${totalFiles} files (${Math.round(downloadProgress)}%)`
                  : `${Math.round(downloadProgress)}%`}
              </Text>
            </View>

            {/* Loading Spinner */}
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.downloadModalSpinner}
            />

            {downloadingAll && (
              <Text style={[styles.downloadModalSubtext, { color: theme.colors.onSurfaceVariant }]}>
                Please wait while files are being saved to your gallery...
              </Text>
            )}
          </View>
        </View>
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

  quickActionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  quickActionSubtitle: {
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
    alignItems: "flex-start",
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

  // Gallery styles
  galleryContainer: {
    marginTop: 12,
  },

  galleryGrid: {
    paddingTop: 8,
  },

  galleryRow: {
    justifyContent: 'flex-start',
  },

  galleryItem: {
    width: '31%',  // Less than 1/3 to account for the 4px gaps
    aspectRatio: 1,  // Square aspect ratio
    marginBottom: 4,  // 4px vertical spacing between rows (equal to horizontal)
    overflow: 'hidden',
  },

  galleryThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  galleryItemCaption: {
    fontSize: 11,
    padding: 4,
    textAlign: 'center',
  },

  galleryLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  galleryLoadingText: {
    marginTop: 8,
    fontSize: 13,
  },

  galleryEmptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  galleryEmptyText: {
    fontSize: 13,
  },

  // Gallery section styles (for direct display without container)
  gallerySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  gallerySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  gallerySectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },

  gallerySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },

  gallerySectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  downloadAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  videoThumbnailContainer: {
    position: 'relative',
  },

  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
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

  galleryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  galleryHeaderContent: {
    flex: 1,
    marginRight: 10,
  },

  galleryHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  galleryCounter: {
    fontSize: 14,
    marginTop: 2,
  },

  gallerySlide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
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

  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
  },

  fullScreenVideo: {
    width: screenWidth,
    height: screenHeight,
  },

  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },

  captionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },

  // Download Progress Modal Styles
  downloadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  downloadModalContent: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  downloadModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  downloadModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },

  progressBarContainer: {
    marginVertical: 20,
  },

  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },

  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  downloadModalSpinner: {
    marginTop: 10,
    marginBottom: 10,
  },

  downloadModalSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});

export default QuickActionAttachmentsScreen;