import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronRight, Zap, Shield, ScanLine } from 'lucide-react-native';

interface HomeScreenProps {
  onGetStarted: () => void;
  onScanClick?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onGetStarted, onScanClick }) => {
  return (
    <View style={styles.container}>
      {/* Background gradients would be implemented with LinearGradient from expo-linear-gradient */}

      <View style={styles.content}>
        {/* Logo with Scan Icon */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={onScanClick}
          activeOpacity={0.8}
        >
          <ScanLine size={64} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.tapToScan}>Tap to Scan</Text>

        {/* Title */}
        <Text style={styles.title}>CardSnap</Text>
        <Text style={styles.description}>
          Turn physical business cards into digital connections instantly with intelligent AI scanning.
        </Text>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Zap size={20} color="#818CF8" />
            <Text style={styles.featureText}>Instant OCR</Text>
          </View>
          <View style={styles.featureCard}>
            <Shield size={20} color="#6EE7B7" />
            <Text style={styles.featureText}>Secure Storage</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.button} onPress={onGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <ChevronRight size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Gemini AI 2.5 Flash</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#4F46E5',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  tapToScan: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 40,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  button: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
});
