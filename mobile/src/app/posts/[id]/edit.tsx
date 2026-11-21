import { useLocalSearchParams } from 'expo-router';
import { PostFormScreen } from '@/components/PostFormScreen';

/** Edição de post (requisito 4), apenas para professores. */
export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostFormScreen id={Number(id)} />;
}
