import * as ImageManipulator from 'expo-image-manipulator';

export const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If message is from today, show time only
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // If message is from this year, show date without year
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
        });
    }

    // Otherwise show full date
    return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const compressImage = async (uri) => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error compressing image:', error);
        return uri;
    }
};

export const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach(message => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
    });

    return groups;
};

export const getLastSeenTime = (timestamp) => {
    if (!timestamp) return 'Offline';

    const lastSeen = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return lastSeen.toLocaleDateString();
};

export const validateMessage = (content) => {
    if (!content || !content.trim()) {
        return { isValid: false, error: 'Message cannot be empty' };
    }

    if (content.length > 1000) {
        return { isValid: false, error: 'Message is too long' };
    }

    return { isValid: true };
};

export const getTypingIndicatorText = (username, isTyping) => {
    if (!isTyping) return null;
    return `${username} is typing...`;
};