import type { TextStyle } from 'react-native';

/**
 * Identidade visual inspirada no material escolar:
 * - quadro: verde de lousa, usado nas barras e na ação principal;
 * - papel, pauta e margem: listas desenhadas como páginas de caderno;
 * - tinta: azul-marinho de caneta para o texto;
 * - correção: vermelho de caneta para excluir e para erros;
 * - marca-texto: amarelo, apenas para destacar o termo buscado.
 */
export const colors = {
  board: '#24453B',
  boardDark: '#183229',
  chalk: '#F1F4EF',
  chalkMuted: '#B8C9BF',
  paper: '#FFFFFF',
  desk: '#F2F4F1',
  rule: '#C9D9EC',
  margin: '#E3A19B',
  ink: '#1D2B3A',
  inkMuted: '#5B6B7A',
  correction: '#C8372D',
  correctionSoft: '#FBEDEB',
  highlighter: '#FFE45C',
  focus: '#2F6FD6',
} as const;

export const fonts = {
  regular: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
  hand: 'Caveat_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Raios diferentes por nível de hierarquia, em vez de um valor único. */
export const radius = {
  control: 4,
  field: 6,
  sheet: 12,
} as const;

/** Largura da margem do caderno (onde fica a data manuscrita). */
export const MARGIN_WIDTH = 64;

/** Altura mínima recomendada para áreas de toque (acessibilidade). */
export const MIN_TOUCH = 44;

/** Escala tipográfica (razão ~1,2 a partir de 16). */
export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, color: colors.ink },
  title: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 29, color: colors.ink },
  heading: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 25, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  reading: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 30, color: colors.ink },
  label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  hand: { fontFamily: fonts.hand, fontSize: 22, lineHeight: 24, color: colors.focus },
} satisfies Record<string, TextStyle>;
