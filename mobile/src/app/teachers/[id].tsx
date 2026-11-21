import { useLocalSearchParams } from 'expo-router';
import { UserFormScreen } from '@/components/UserFormScreen';

/** Edição de professor (requisito 6). */
export default function EditTeacherScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserFormScreen role="teacher" id={Number(id)} />;
}
