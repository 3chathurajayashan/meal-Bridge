import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  // Animation values
  const nameTranslateY = useRef(new Animated.Value(20)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0.94)).current;

  const taglineTranslateY = useRef(new Animated.Value(14)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Verification checkmark animation values
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Apple-style custom bezier curve (fast out, ultra-smooth stop)
    const appleEase = Easing.bezier(0.25, 1, 0.5, 1);

    const sequence = Animated.sequence([
      // 1. Brand name reveal with simultaneous scale + translateY + opacity
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 600,
          easing: appleEase,
          useNativeDriver: true,
        }),
        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: 600,
          easing: appleEase,
          useNativeDriver: true,
        }),
        Animated.timing(nameScale, {
          toValue: 1,
          duration: 600,
          easing: appleEase,
          useNativeDriver: true,
        }),
      ]),

      // 2. Overlapping tagline reveal
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          easing: appleEase,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          easing: appleEase,
          useNativeDriver: true,
        }),
      ]),

      // 3. Apple-style smooth verification checkmark pop-in
      Animated.parallel([
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 400,
          easing: appleEase,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),

      // 4. Subtle dwell time to register the success state
      Animated.delay(700),

      // 5. Smooth iOS-style fade out transition
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.bezier(0.32, 0, 0.67, 0),
        useNativeDriver: true,
      }),
    ]);

    sequence.start(({ finished }) => {
      if (finished) {
        router.replace('/onboarding');
      }
    });

    return () => {
      sequence.stop();
    };
  }, [router]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Brand text & Verification Check centered */}
      <View style={styles.textContainer}>
        <Animated.View
          style={[
            styles.checkBadge,
            {
              opacity: checkOpacity,
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          <Text style={styles.checkmarkText}>✓</Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: nameOpacity,
              transform: [
                { translateY: nameTranslateY },
                { scale: nameScale },
              ],
            },
          ]}
        >
          Meal Bridge
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [
                { translateY: taglineTranslateY },
              ],
            },
          ]}
        >
          Fresh Food, Delivered.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  checkBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  checkmarkText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  brandName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },

  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    fontWeight: '400',
    textAlign: 'center',
  },
});