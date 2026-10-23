import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../../constants/colors';
import { dimensions, spacing } from '../../../../constants/dimensions';
import { typography } from '../../../../constants/typography';
import { strings } from '../../../../constants/strings';
import { usePrivacyStore } from '../store/privacyStore';

export function PrivacyToggle() {
  const amountsHidden = usePrivacyStore(state => state.amountsHidden);
  const toggleAmountsHidden = usePrivacyStore(
    state => state.toggleAmountsHidden,
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={strings.privacy.toggleLabel}
      accessibilityState={{ checked: amountsHidden }}
      onPress={toggleAmountsHidden}
      style={styles.button}
      hitSlop={dimensions.controlHitSlop}
    >
      <Text style={styles.label}>{strings.privacy.toggleLabel}</Text>
      <View style={[styles.track, amountsHidden && styles.trackActive]}>
        <View style={[styles.thumb, amountsHidden && styles.thumbActive]} />
      </View>
      <Text style={styles.state}>
        {amountsHidden ? strings.privacy.hidden : strings.privacy.visible}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: dimensions.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
  },
  label: {
    color: colors.privacyMask,
    fontSize: typography.fontSize.bodyCompact,
    fontWeight: typography.fontWeight.medium,
  },
  track: {
    width: dimensions.privacySwitchWidth,
    height: dimensions.privacySwitchHeight,
    borderRadius: dimensions.switchRadius,
    backgroundColor: colors.switchOff,
    justifyContent: 'center',
    paddingHorizontal: spacing.s3,
  },
  trackActive: {
    backgroundColor: colors.primary,
  },
  thumb: {
    width: dimensions.privacyThumbSize,
    height: dimensions.privacyThumbSize,
    borderRadius: dimensions.thumbRadius,
    backgroundColor: colors.surface,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  state: {
    width: dimensions.privacyStatusWidth,
    color: colors.privacyMask,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold,
  },
});
