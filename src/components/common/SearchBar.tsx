import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  editable?: boolean;
  onPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search for available food...',
  onFilterPress,
  hasActiveFilters = false,
  onClear,
  editable = true,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={editable && !onPress}
      style={styles.container}
    >
      <View style={styles.searchBox}>
        <SafeIcon name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          style={styles.input}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText('');
              if (onClear) onClear();
            }}
            style={styles.clearButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <SafeIcon name="close" size={16} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <SafeIcon
            name="filter"
            size={18}
            color={hasActiveFilters ? COLORS.white : COLORS.black}
          />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  searchBox: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.black,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary, // Orange 500
    borderColor: COLORS.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});

export default SearchBar;
