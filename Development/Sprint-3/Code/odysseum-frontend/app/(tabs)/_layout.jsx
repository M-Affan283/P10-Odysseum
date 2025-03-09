import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { Tabs, Redirect } from "expo-router";
import { HomeIcon, MagnifyingGlassCircleIcon, PlusCircleIcon, BookmarkIcon, UserIcon } from "react-native-heroicons/solid";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect } from "react";

const TabsLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home"   options={{ title: "Home", headerShown: false}} />
      <Tabs.Screen name="search" options={{ title: "Search", headerShown: false}} />
      <Tabs.Screen name="create" options={{title:"Create", headerShown: false}} />
      <Tabs.Screen name="bookmark" options={{title:"Bookmark", headerShown: false}} />
      <Tabs.Screen name="profile" options={{title:"Profile", headerShown: false}} />
    </Tabs>
  )
};

const TabBar = ({ state, descriptors ,navigation }) => {


  return (
    <View style={{position:'absolute', bottom:0, flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'black', paddingVertical: 10, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderCurve:'continuous'}}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        if(['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
            color={isFocused ? '#800080' : '#CDCDE0'} 
          />
        )
      })}
    </View>
  );
}

const TabBarButton = (props) => {
  
  const {isFocused, onPress, onLongPress, routeName, label, color} = props;

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring((isFocused ? 1 : 0) , {duration: 100});
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.5]);

    const topValue = interpolate(scale.value, [0, 1], [0, 7]);

    return {
      transform: [{scale: scaleValue}],
      top: topValue
    }
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity: opacity
    }
  });

  const icons = {
    home: (props) => <HomeIcon size={24} color={'#CDCDE0'} {...props}/>,
    search: (props) => <MagnifyingGlassCircleIcon size={24} color={'#CDCDE0'} {...props}/>,
    create: (props) => <PlusCircleIcon size={24} color={'#CDCDE0'} {...props}/>,
    bookmark: (props) => <BookmarkIcon size={24} color={'#CDCDE0'} {...props}/>,
    profile: (props) => <UserIcon size={24} color={'#CDCDE0'} {...props}/>,
  }

  return (
    <TouchableOpacity {...props} className="flex-1 justify-center items-center gap-1"> 
      <Animated.View style={animatedIconStyle}>
        {icons[routeName]({color})}


      </Animated.View>
      <Animated.Text style={[{color, fontSize: 10}, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  )
}

export default TabsLayout;