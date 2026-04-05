import { Stack } from 'expo-router';

export default function PracticeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFF8F9' } }}>
      <Stack.Screen name="flashcards" />
      <Stack.Screen name="listening" />
      <Stack.Screen name="exam" />
      <Stack.Screen name="exam-result" />
      <Stack.Screen name="lesson-setup" />
      <Stack.Screen name="lesson-complete" />
    </Stack>
  );
}
