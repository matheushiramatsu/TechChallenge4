import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { boardHeader } from '@/navigationOptions';
import { colors, fonts } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Ícone da aba; a aba ativa ganha um traço de marca-texto embaixo. */
function TabIcon({ name, color, focused }: { name: IconName; color: ColorValue; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      {/* A tab bar sempre envia uma cor em string (tabBarActiveTintColor/InactiveTintColor). */}
      <Ionicons name={name} size={23} color={color as string} />
      <View style={[styles.mark, focused && styles.markActive]} />
    </View>
  );
}

function tabIcon(name: IconName) {
  return function renderTabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <TabIcon name={name} color={color} focused={focused} />;
  };
}

/**
 * Abas principais. Alunos veem apenas "Posts" e "Perfil";
 * as abas administrativas ficam protegidas por papel (Tabs.Protected).
 */
export default function TabsLayout() {
  const { isTeacher } = useAuth();

  return (
    <Tabs
      screenOptions={{
        ...boardHeader,
        tabBarActiveTintColor: colors.board,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.rule },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Blog Escolar', tabBarLabel: 'Posts', tabBarIcon: tabIcon('reader-outline') }}
      />
      <Tabs.Protected guard={isTeacher}>
        <Tabs.Screen
          name="admin"
          options={{ title: 'Gerenciar posts', tabBarLabel: 'Gerenciar', tabBarIcon: tabIcon('create-outline') }}
        />
        <Tabs.Screen
          name="teachers"
          options={{ title: 'Professores', tabBarIcon: tabIcon('easel-outline') }}
        />
        <Tabs.Screen
          name="students"
          options={{ title: 'Alunos', tabBarIcon: tabIcon('people-outline') }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="profile"
        options={{ title: 'Minha conta', tabBarLabel: 'Conta', tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
  },
  mark: {
    width: 22,
    height: 4,
    marginTop: 1,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  markActive: {
    backgroundColor: colors.highlighter,
  },
});
