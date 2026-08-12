import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingSecond() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      <Pressable
        style={styles.backButton}
        hitSlop={12}
        onPress={() => router.back()}
      >
        <View style={styles.backArrow} />
      </Pressable>

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
            <View style={styles.markRing} />
            <View style={styles.markCore} />
          </View>
          <View style={styles.markAccentOne} />
          <View style={styles.markAccentTwo} />
          <View style={styles.markAccentThree} />
        </View>

        <Text style={styles.title}>Fast, Reliable Delivery</Text>

        <Text style={styles.description}>
          Track your order in real time and get{'\n'}
          it delivered right to your door.
        </Text>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push('/onboarding/third')}
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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  backArrow: {
    width: 9,
    height: 9,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#1C1C1E',
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
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

  markRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 10,
    borderColor: '#FFE3CC',
  },

  markCore: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
  },

  markAccentOne: {
    position: 'absolute',
    top: 24,
    left: 30,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFB88A',
  },

  markAccentTwo: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF6B00',
    opacity: 0.9,
  },

  markAccentThree: {
    position: 'absolute',
    top: 40,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCBA1',
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