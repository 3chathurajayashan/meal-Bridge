import React, { useEffect, useRef, useState } from 'react';
import img1 from '../../assets/s1.png'; // Adjust path if needed for your third image asset
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingThird() {
  const router = useRouter();

  // Animation states
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Screen entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Apple-like morphing button animations
  const buttonWidthAnim = useRef(new Animated.Value(1)).current; // 1 = 100% width, or interpolated
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (status !== 'idle') return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (status !== 'idle') return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handleGetStarted = () => {
    if (status !== 'idle') return;
    setStatus('loading');

    // Step 1: Smoothly fade out current text and shrink button width slightly to feel dynamic
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Simulate verification/loading delay (e.g., 1.2 seconds)
      setTimeout(() => {
        setStatus('success');
        
        // Pop in the success verification state smoothly
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start(() => {
          // Wait briefly to let the user register "All Set!", then navigate
          setTimeout(() => {
            router.push('/onboarding/RoleSelectionScreen');
          }, 600);
        });
      }, 1200);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Full-width and upper height edge-to-edge image */}
        <View style={styles.imageWrap}>
          <Image source={img1} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>You're All Set</Text>
          <Text style={styles.description}>
            Create an account to start ordering{'\n'}
            and enjoy a seamless experience.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <Pressable
          style={styles.pressable}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleGetStarted}
          disabled={status !== 'idle'}
        >
          <Animated.View
            style={[
              styles.button,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {status === 'idle' && (
              <Animated.Text style={[styles.buttonText, { opacity: contentFadeAnim }]}>
                Get Started
              </Animated.Text>
            )}

            {status === 'loading' && (
              <Animated.View style={{ opacity: contentFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
              }) }}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </Animated.View>
            )}

            {status === 'success' && (
              <Animated.Text
                style={[
                  styles.buttonText,
                  { transform: [{ scale: successScaleAnim }] },
                ]}
              >
                All Set ✓
              </Animated.Text>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  imageWrap: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 23,
    color: '#8E8E93',
    textAlign: 'center',
    letterSpacing: -0.2,
    maxWidth: 300,
  },

  bottom: {
    paddingBottom: 50,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
  },

  dots: {
    flexDirection: 'row',
    marginBottom: 32,
    alignItems: 'center',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 22,
    borderRadius: 3,
    backgroundColor: '#FF6B00',
  },

  pressable: {
    width: '100%',
  },

  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});