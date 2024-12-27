import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import {useEffect, useState} from 'react'
import useUserStore from '../context/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import BookmarkPNG from '../../assets/Bookmark.png'
import DefaultBookmarkPNG from '../../assets/DefaultBookmark.png'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'

const BookmarkScreen = () => {
    
    const user = useUserStore((state) => state.user);
    //store the bookmarks of locations. should be in a nice modern style. Clickable to go to the location page
    const [bookmarks, setBookmarks] = useState(user?.bookmarks || []);
    const [filteredBookmarks, setFilteredBookmarks] = useState(bookmarks);
    const [search, setSearch] = useState(''); //for searching through bookmarks
    

    const filterBookmarks = () =>
    {
        //filter the bookmarks based on the search query
        //if the search query is empty, show all bookmarks
        //if the search query is not empty, show only the bookmarks that contain the search query

        if(search === '') setFilteredBookmarks(bookmarks);
        else
        {
            const filtered = bookmarks.filter((bookmark) => bookmark.name.toLowerCase().includes(search.toLowerCase()));
            setFilteredBookmarks(filtered);
        }
    }
    
    //every time the search query changes, filter the bookmarks and update the view
    
    useEffect(()=>{
        filterBookmarks();
    }, [search, bookmarks])

    

    
  return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-6 mt-10">

            <View className="mx-7 flex-row justify-between items-center mb-10">
                <Text className="font-bold text-neutral-700 text-2xl">Bookmarks</Text>

                <TouchableOpacity>
                    <Image source={BookmarkPNG} style={{width: 80, height: 80, borderRadius: 35}} />
                </TouchableOpacity>
            </View>

            {/* Search bookmarks */}
            <View className="mx-5 mb-4">
                <View className="flex-row items-center bg-neutral-100 rounded-full space-x-2 pl-6">
                <MaterialIcons name="search" size={20} color="black" />

                <TextInput
                    placeholder='Search bookmarks'
                    placeholderTextColor={'gray'}
                    value={search}
                    className="flex-1 text-base mb-1 pl-1 tracking-wider"
                    onChangeText={(text) => setSearch(text)}
                />

                </View>
            </View>

            {/* Show bookmarks */}
            { filteredBookmarks.length > 0 &&
                <View className="mx-5 flex-row justify-between flex-wrap">
                    {/* <BookMarkCard bookmark={{name: 'Chitral, KPK'}} /> */}
                    {filteredBookmarks.map((bookmark, index) => (
                        <BookMarkCard bookmark={bookmark} key={index} />
                    ))}
                </View>
            }

        </ScrollView>
    </SafeAreaView>
  )
}

const BookMarkCard = ({bookmark}) => {
    return (
        <TouchableOpacity className="flex justify-end relative p-0 py-6 space-y-2 mb-4" style={{ width: '44%', height: 150 }} onPress={()=> router.push(`/location/${bookmark._id}`)}>
            <Image source={bookmark?.imageUrl? {uri: bookmark?.imageUrl} : DefaultBookmarkPNG}  className="absolute rounded-lg h-full w-full" />
        
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,1)']}
                style={{width: 150, height: 30, borderBottomLeftRadius: 35, borderBottomRightRadius: 35}}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0"
            />

            <Text className="text-white font-semibold"> {bookmark.name} </Text>

        
        
        </TouchableOpacity>
    )
}
export default BookmarkScreen