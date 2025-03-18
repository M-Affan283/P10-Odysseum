import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '../../src/screens/ChatScreen';
import ChatErrorBoundary from '../../src/components/ChatErrorBoundary';

export default function Chat() {
  const { id } = useLocalSearchParams();
  
  return (
    <ChatErrorBoundary>
      <ChatScreen chatId={id} />
    </ChatErrorBoundary>
  );
}