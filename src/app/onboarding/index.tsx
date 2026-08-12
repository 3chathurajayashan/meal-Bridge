import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
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
        <View style={styles.markWrap}>
          <View style={styles.markOuter}>
            <View style={styles.markMid}>
              <View style={styles.markInner} />
            </View>
          </View>
          <View style={styles.markAccentOne} />
          <View style={styles.markAccentTwo} />
        </View>

        <Text style={styles.title}>Discover Great Food</Text>

        <Text style={styles.description}>
          Explore delicious food from local shops{'\n'}
          and discover something you'll love.
        </Text>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
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
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },

  markWrap: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 56,
  },

  markOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF5EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markMid: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#FFE3CC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    transform: [{ rotate: '45deg' }],
  },

  markAccentOne: {
    position: 'absolute',
    top: 18,
    right: 22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
    opacity: 0.9,
  },

  markAccentTwo: {
    position: 'absolute',
    bottom: 26,
    left: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB88A',
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