import { useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const SearchInput = ({ title ,initialQuery, queryType }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  // const [queryType, setQueryType] = useState(queryType || "search");

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-regular"
        value={query}
        placeholder={`Search for ${title}`}
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity
        onPress={() => {
          if (query === "")
            return Alert.alert(
              "Missing Query",
              "Please input something to search results across database"
            );

            //set query and queryType in the router
          if (pathname.startsWith("/search")) router.setParams({ query, queryType });
          else router.push(`/search/${query}?queryType=${queryType}`);
        }}
      >
       <MaterialIcons name="search" size={24} color="white" className="w-5 h-5"/>
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;