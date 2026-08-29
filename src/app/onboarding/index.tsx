import React, { useEffect, useRef } from 'react';
import img1 from '../../assets/f20.jpg';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingFirst() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
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
          <Text style={styles.title}>Discover Great Food</Text>
          <Text style={styles.description}>
            Explore delicious food from local shops{'\n'}
            and discover something you'll love.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          style={styles.pressable}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push('/onboarding/second')}
        >
          <Animated.View
            style={[
              styles.button,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.buttonText}>Next</Text>
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
    // Removed paddingHorizontal here so the image goes edge-to-edge
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  imageWrap: {
    width: '100%',
    flex: 1, // Expands to take up maximum upper height dynamically
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    paddingHorizontal: 28, // Re-applied padding specifically for text
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
    paddingHorizontal: 28, // Re-applied padding for the button & dots
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