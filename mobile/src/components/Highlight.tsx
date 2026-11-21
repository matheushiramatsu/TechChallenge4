import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '@/theme';

const normalizeChar = (c: string) => c.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Divide o texto em trechos, marcando os que batem com o termo (ignora acentos). */
function splitByTerm(text: string, term: string): { part: string; match: boolean }[] {
  const needle = [...term.trim()].map(normalizeChar).join('');
  if (!needle) return [{ part: text, match: false }];

  const chars = [...text];
  const haystack = chars.map(normalizeChar);
  const parts: { part: string; match: boolean }[] = [];
  let start = 0;
  let i = 0;
  while (i < chars.length) {
    if (haystack.slice(i, i + needle.length).join('') === needle) {
      if (i > start) parts.push({ part: chars.slice(start, i).join(''), match: false });
      parts.push({ part: chars.slice(i, i + needle.length).join(''), match: true });
      i += needle.length;
      start = i;
    } else {
      i += 1;
    }
  }
  if (start < chars.length) parts.push({ part: chars.slice(start).join(''), match: false });
  return parts;
}

/** Texto com o termo buscado marcado como se fosse com marca-texto. */
export function Highlight({ text, term, ...props }: TextProps & { text: string; term?: string }) {
  if (!term) return <Text {...props}>{text}</Text>;
  return (
    <Text {...props}>
      {splitByTerm(text, term).map((p, index) =>
        p.match ? (
          <Text key={index} style={styles.mark}>
            {p.part}
          </Text>
        ) : (
          p.part
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.highlighter,
  },
});
