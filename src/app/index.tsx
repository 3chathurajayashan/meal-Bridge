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
  const nameTranslateY = useRef(new Animated.Value(16)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;

  const taglineTranslateY = useRef(new Animated.Value(12)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // 1. Brand name reveal
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),

        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]),

      // 2. Tagline reveal
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),

        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]),

      // 3. Subtle dwell time
      Animated.delay(700),

      // 4. Smooth iOS-style fade out
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
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

      {/* Brand text centered */}
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: nameOpacity,
              transform: [
                {
                  translateY: nameTranslateY,
                },
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
                {
                  translateY: taglineTranslateY,
                },
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

  brandName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginBottom: 12,
    textAlign: 'center',
  },

  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
    fontWeight: '400',
    textAlign: 'center',
  },
});