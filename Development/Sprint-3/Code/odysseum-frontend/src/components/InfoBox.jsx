import { View, Text } from "react-native";

const InfoBox = ({ title, subtitle, containerStyles, titleStyles }) => {
  return (
    <View className={containerStyles}>
      <Text className={`text-white text-center font-semibold ${titleStyles}`}>
        {title}
      </Text>
      <Text className="text-sm text-gray-100 text-center font-regular">
        {subtitle}
      </Text>
    </View>
  );
};

export default InfoBox;