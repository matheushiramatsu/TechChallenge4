import { colors, fonts } from './theme';

/** Estilo das barras superiores: o "quadro-negro" do app. */
export const boardHeader = {
  headerStyle: { backgroundColor: colors.board },
  headerTintColor: colors.chalk,
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 19, color: colors.chalk },
  headerShadowVisible: false,
} as const;
