import { Stack } from 'expo-router';

export default function PracticeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="custom-dictation" />
      <Stack.Screen name="exam-result" />
      <Stack.Screen name="exam" />
      <Stack.Screen name="flashcards" />
      <Stack.Screen name="grammar" />
      <Stack.Screen name="lesson-complete" />
      <Stack.Screen name="lesson-setup" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="listening" />
      <Stack.Screen name="srs-review" />
    </Stack>
  );
}
