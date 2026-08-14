import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/use-theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export function Button({ label, onPress, disabled, icon }: ButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.button, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}>
      {icon}
      <Text style={[styles.label, { color: theme.buttonText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  label: { fontSize: 16, fontWeight: '600' },
});
