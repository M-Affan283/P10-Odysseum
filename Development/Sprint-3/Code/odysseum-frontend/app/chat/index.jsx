import ChatListScreen from '../../src/screens/ChatListScreen';
import ChatErrorBoundary from '../../src/components/ChatErrorBoundary';

export default function ChatList() {
  return (
    <ChatErrorBoundary>
      <ChatListScreen />
    </ChatErrorBoundary>
  );
}