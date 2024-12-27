import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import {useCallback, useState} from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import Feather from '@expo/vector-icons/Feather';
import LottieView from 'lottie-react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList } from 'react-native-gesture-handler';

//will open when user clicks on comments count
const CommentModal = ({bottomSheetRef, comments, loading, addComment}) =>
{
    const [commentInput, setCommentInput] = useState('');
    
    const renderBackDrop = useCallback((props) => (
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
    ))

    // try npm install react-native-actions-sheet
    
    const handleCommentInput = (text) =>
    {
    addComment(text);
    setCommentInput('');
    }
    
    return (
    <BottomSheetModalProvider>
        
        <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['80%']}
        index={1}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{ backgroundColor: '#1d0f4e' }}
        backdropComponent={renderBackDrop}
        keyboardBehavior='extend' //check this out
        keyboardBlurBehavior='restore'
        android_keyboardInputMode='adjustResize'
        maxDynamicContentSize={600}
        >

        <BottomSheetView style={{ flex: 1, backgroundColor: '#161622' }}>

            { loading ? (
            <View className="flex items-center justify-center h-full">
                <LottieView
                source={require('../../assets/LoadingAnimation.json')}
                style={{
                    width: 100,
                    height: 100,
                }}
                autoPlay
                loop
                />
            </View>
            )
            : 
            (
            <View className="flex-1">
                <View className="flex-1 flex-grow">
                <FlatList
                    data={comments}
                    // extraData={comments} check this out
                    renderItem={({ item }) => <CommentCard comment={item} />}
                    keyExtractor={(item) => item._id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ padding: 5 }}
                    ListEmptyComponent={() => (
                    <View className="flex justify-center items-center px-4">
                        <MaterialIcons name='hourglass-empty' size={24} color='white' className="w-[270px] h-[216px]"/>
                        <Text className="text-sm font-medium text-gray-100">Empty</Text>
                        <Text className="text-xl text-center font-semibold text-white mt-2">
                            No comments yet.
                        </Text>
                    </View>
                    )}
                    
                />
                </View>
                {/* footer containing input*/}
                <View className="flex flex-row justify-center py-4">
                    <TextInput placeholder='Add a comment...' placeholderTextColor="white" style={{color: 'white', width: '80%', padding: 10, borderRadius: 8, backgroundColor: '#333'}} onChangeText={(text)=>setCommentInput(text)} />
                    <TouchableOpacity onPress={()=>handleCommentInput(commentInput)} className="flex justify-center items-center" style={{padding: 10, borderRadius: 8}}>
                        <Feather name="send" size={24} color="orange" /*tyle={{padding: 10, backgroundColor: '#333', borderRadius: 8}}*/ />
                    </TouchableOpacity>
                </View>

            </View>
            )}

        </BottomSheetView>

        </BottomSheetModal>
    </BottomSheetModalProvider>

    

    )
}

const CommentCard = ({comment}) =>
{
    return (
    <View className="flex flex-row items-start gap-4 py-4" style={comment?.blurred ? {opacity: 0.5} : {opacity: 1}}>
        {/* Profile Picture */}
        <Image
        source={{ uri: comment?.profilePicture }}
        className="w-12 h-12 rounded-full"
        />
        {/* Comment */}
        <View className="flex flex-col">
        <Text className="text-white text-xs">{comment?.username}</Text>
        <Text className="text-white">{comment?.text}</Text>
        </View>
        
    </View>
    )
}

export default CommentModal