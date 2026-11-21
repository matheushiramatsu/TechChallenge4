import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, MIN_TOUCH, radius, spacing } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** "board" para uso sobre o fundo verde do quadro. */
  tone?: 'paper' | 'board';
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar',
  tone = 'paper',
}: SearchBarProps) {
  const onBoard = tone === 'board';
  const iconColor = onBoard ? colors.chalkMuted : colors.inkMuted;

  return (
    <View style={[styles.container, onBoard ? styles.board : styles.paper]}>
      <Ionicons name="search" size={19} color={iconColor} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: onBoard ? colors.chalk : colors.ink }]}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={12}
        >
          <Ionicons name="close" size={20} color={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.field,
    borderWidth: 1.5,
  },
  paper: {
    backgroundColor: colors.paper,
    borderColor: colors.rule,
  },
  board: {
    backgroundColor: colors.boardDark,
    borderColor: colors.boardDark,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
});
