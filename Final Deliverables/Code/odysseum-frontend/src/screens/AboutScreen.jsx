import { View, Text, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { router } from 'expo-router';

const AboutScreen = () => {
    const appVersion = "0.2.0"; // sprint 2 for now

    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            
            {/* Header */}
            <View className="flex-row items-center gap-x-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeftIcon size={30} color='white' />
                </TouchableOpacity>
                <Text className="text-3xl font-dsbold text-purple-500">About</Text>
            </View>

            <ScrollView className="mt-5" contentContainerStyle={{ paddingBottom: 30 }}>

                {/* Writing app version */}
                <View className="bg-gray-800 p-4 rounded-lg">
                    <Text className="text-white text-lg">App Version</Text>
                    <Text className="text-gray-400 mt-1">{appVersion}</Text>
                </View>

                {/* Links section - (Not implemented) */}
                <View className="mt-6">
                    <TouchableOpacity 
                        onPress={() => Linking.openURL('https://odysseum.com/terms')}
                        className="p-4 bg-gray-800 rounded-lg mt-2"
                    >
                        <Text className="text-blue-400">Terms of Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => Linking.openURL('https://odysseum.com/privacy')}
                        className="p-4 bg-gray-800 rounded-lg mt-2"
                    >
                        <Text className="text-blue-400">Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

                {/* Support section - (Works) */}
                <View className="mt-6">
                    <Text className="text-white text-lg">Need Help?</Text>

                    <TouchableOpacity 
                        onPress={() => Linking.openURL('mailto:group10.sproj@gmail.com')}
                        className="p-4 bg-gray-800 rounded-lg mt-2"
                    >
                        <Text className="text-blue-400">Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AboutScreen;
