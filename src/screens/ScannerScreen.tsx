import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Check, RotateCcw, ArrowRight, User, Briefcase, Phone } from 'lucide-react-native';
import { Contact } from '../types';
import { extractContactFromImage } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ScanStep = 'SCAN_FRONT' | 'DECISION' | 'SCAN_BACK' | 'PROCESSING' | 'REVIEW';

interface ScannerScreenProps {
  onClose: () => void;
  onScanComplete: (contact: Contact) => void;
  existingContacts: Contact[];
}

const HighlightField: React.FC<{
  icon: React.ComponentType<any>;
  value?: string;
}> = ({ icon: Icon, value }) => {
  if (!value) return null;
  return (
    <View style={styles.highlightField}>
      <Icon size={16} color="#4F46E5" />
      <Text style={styles.highlightText} numberOfLines={1}>{value}</Text>
      <Check size={14} color="#10B981" />
    </View>
  );
};

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onClose, onScanComplete, existingContacts }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [scanStep, setScanStep] = useState<ScanStep>('SCAN_FRONT');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<Contact | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: true,
      });

      if (!photo || !photo.base64) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      const imageBase64 = `data:image/jpeg;base64,${photo.base64}`;

      if (scanStep === 'SCAN_FRONT') {
        setFrontImage(imageBase64);
        setScanStep('DECISION');
      } else if (scanStep === 'SCAN_BACK') {
        setBackImage(imageBase64);
        setScanStep('PROCESSING');
        processImages(frontImage!, imageBase64);
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture image');
    } finally {
      setIsCapturing(false);
    }
  }, [cameraRef, isCapturing, scanStep, frontImage]);

  const checkForDuplicate = useCallback((contact: Contact): boolean => {
    // Check if contact already exists by email or phone
    return existingContacts.some(
      (existing) =>
        (contact.email && existing.email === contact.email) ||
        (contact.phone && existing.phone === contact.phone) ||
        (contact.fullName && existing.fullName.toLowerCase() === contact.fullName.toLowerCase())
    );
  }, [existingContacts]);

  const processImages = useCallback(async (front: string, back?: string) => {
    try {
      const extractedData = await extractContactFromImage(front, back);

      const newContact: Contact = {
        id: uuidv4(),
        scannedAt: new Date().toISOString(),
        frontImage: front,
        backImage: back,
        ...extractedData,
      };

      setScanResult(newContact);
      setScanStep('REVIEW');
      // No auto-save - wait for user to click save button
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not extract details. Please try again.');
      setFrontImage(null);
      setBackImage(null);
      setScanResult(null);
      setScanStep('SCAN_FRONT');
    }
  }, []);

  const handleSkipBack = useCallback(() => {
    if (frontImage) {
      setScanStep('PROCESSING');
      processImages(frontImage);
    }
  }, [frontImage, processImages]);

  const startBackScan = useCallback(() => {
    setScanStep('SCAN_BACK');
  }, []);

  const handleRetake = useCallback(() => {
    setFrontImage(null);
    setBackImage(null);
    setScanResult(null);
    setScanStep('SCAN_FRONT');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!scanResult) return;

    // Check for duplicate
    if (checkForDuplicate(scanResult)) {
      Alert.alert(
        'Duplicate Contact',
        'This contact already exists in your list. Do you want to save it anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: () => onScanComplete(scanResult),
          },
        ]
      );
    } else {
      onScanComplete(scanResult);
    }
  }, [scanResult, checkForDuplicate, onScanComplete]);

  // Handle permission loading state
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Handle permission not granted
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to access the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {(scanStep === 'SCAN_FRONT' || scanStep === 'SCAN_BACK') && (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            />

            {/* Scanning Overlay */}
            <View style={styles.overlay}>
              <View style={styles.overlayDark} />
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
            </View>

            <View style={styles.instructionContainer}>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  {scanStep === 'SCAN_FRONT' ? 'Align card front in frame' : 'Align card back in frame'}
                </Text>
              </View>
            </View>

            {/* Capture Button */}
            <View style={styles.captureContainer}>
              <TouchableOpacity
                onPress={handleCapture}
                style={styles.captureButton}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Decision Step */}
        {scanStep === 'DECISION' && frontImage && (
          <View style={styles.decisionContainer}>
            <Image source={{ uri: frontImage }} style={styles.previewImage} blurRadius={5} />
            <View style={styles.decisionOverlay}>
              <View style={styles.decisionCard}>
                <Text style={styles.decisionTitle}>Front Captured</Text>
                <Text style={styles.decisionSubtitle}>Does this card have details on the back?</Text>

                <TouchableOpacity onPress={startBackScan} style={styles.primaryButton}>
                  <RotateCcw size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>Scan Backside</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkipBack} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>No, Process Front Only</Text>
                  <ArrowRight size={20} color="#334155" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRetake}>
                  <Text style={styles.retakeText}>Retake Front</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Processing State */}
        {scanStep === 'PROCESSING' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.processingTitle}>Analyzing Card</Text>
            <Text style={styles.processingSubtitle}>
              {backImage ? 'Merging Front & Back details...' : 'Extracting contact details...'}
            </Text>
          </View>
        )}

        {/* Review State */}
        {scanStep === 'REVIEW' && scanResult && (
          <View style={styles.reviewContainer}>
            <View style={styles.reviewCard}>
              <View style={styles.checkIconContainer}>
                <Check size={28} color="#FFF" strokeWidth={3} />
              </View>
              <Text style={styles.reviewTitle}>Scan Complete</Text>
              <Text style={styles.reviewSubtitle}>Saving contact...</Text>

              <View style={styles.highlightContainer}>
                <HighlightField icon={User} value={scanResult.fullName} />
                <HighlightField icon={Briefcase} value={scanResult.company} />
                <HighlightField icon={Phone} value={scanResult.phone} />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleRetake} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleConfirm()} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '7.5%',
    width: '85%',
    aspectRatio: 1.586,
    borderRadius: 15,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFF',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 15,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 15,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 15,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 15,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  decisionContainer: {
    flex: 1,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  decisionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 24,
  },
  decisionCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  decisionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  decisionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retakeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  processingTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },
  processingSubtitle: {
    color: '#A5B4FC',
    fontSize: 14,
    marginTop: 8,
  },
  reviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 24,
  },
  reviewCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
  },
  checkIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#A5B4FC',
    textAlign: 'center',
    marginBottom: 24,
  },
  highlightContainer: {
    marginBottom: 24,
    gap: 8,
  },
  highlightField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    gap: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
