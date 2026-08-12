import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingThird() {
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
            <View style={styles.markSquareBack} />
            <View style={styles.markSquareFront} />
            <View style={styles.markCheck} />
          </View>
          <View style={styles.markAccentOne} />
          <View style={styles.markAccentTwo} />
        </View>

        <Text style={styles.title}>You're All Set</Text>

        <Text style={styles.description}>
          Create an account to start ordering{'\n'}
          and enjoy a seamless experience.
        </Text>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push('/auth')}
        >
          <Animated.View
            style={[
              styles.button,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
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

  markSquareBack: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFE3CC',
    transform: [{ rotate: '12deg' }],
  },

  markSquareFront: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markCheck: {
    width: 34,
    height: 18,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -3 }],
  },

  markAccentOne: {
    position: 'absolute',
    top: 22,
    right: 26,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFB88A',
  },

  markAccentTwo: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B00',
    opacity: 0.85,
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