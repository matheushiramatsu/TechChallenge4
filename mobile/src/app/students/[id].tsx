import { useLocalSearchParams } from 'expo-router';
import { UserFormScreen } from '@/components/UserFormScreen';

/** Edição de aluno (requisito 8). */
export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserFormScreen role="student" id={Number(id)} />;
}
