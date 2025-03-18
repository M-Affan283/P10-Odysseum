import { View, Text, FlatList, Image, Dimensions     } from 'react-native'
import React, { useRef, useState } from 'react'
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const Carousel = ({ imagesUri }) => {

    const scrollX = useSharedValue(0);

    const [paginationIndex, setPaginationIndex] = useState(0)

    const onScrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x
        }
    })

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }

    const onViewableItemsChanged = ({viewableItems} ) =>
    {
        // console.log("Viewable Items: ", viewableItems)
        if(viewableItems && viewableItems.length > 0 && viewableItems[0].index !== undefined && viewableItems[0].index !== null)
        {
            setPaginationIndex(viewableItems[0].index)
        }
    }

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged },
    ])

    // console.log("Images Carousel: ", imagesUri)
  return (
    <>
        <View className="flex-1 justify-center items-center">
            <Animated.FlatList
                data={imagesUri}
                renderItem={({ item, index }) => (
                    <SliderItem item={item} index={index} scrollX={scrollX} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                onScroll={onScrollHandler}
                removeClippedSubviews={false}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                // contentContainerStyle={{ paddingBottom: 20 }}
                style= {{width: width}}
                />
        </View>
        <Pagination items={imagesUri} paginationIndex={paginationIndex} scrollX={scrollX} />
    </>
  )
}

let {width} = Dimensions.get('screen')

const SliderItem = ({item, index, scrollX}) =>
{
    const rnAnimatedStyle = useAnimatedStyle(() =>
    {
        return {
            transform: [
                {
                    translateX: interpolate(scrollX.value, [(index - 1) * width, width * index, (index + 1) * width], [-width * 0.25, 0, width * 0.25], Extrapolation.CLAMP),
                },
                {
                    scale: interpolate(scrollX.value, [width * (index - 1), width * index, width * (index + 1)], [0.9, 1, 0.9], Extrapolation.CLAMP)
                },
            ]
        }
    })

    return (
        <Animated.View style={[{width:width, justifyContent:'center', alignItems:'center', gap:20}, rnAnimatedStyle]}>
            <Image source={{uri: item}} style={{width: 300, height: 500, borderRadius: 20}} />
        </Animated.View>
    )
}

const Pagination = ({ items, paginationIndex, scrollX }) =>
{

    return (
        <View className="flex-row justify-center my-3">
            {
                items.map((_, index)=>{

                    const pgAnimationStyle = useAnimatedStyle(() => 
                    {
                        const dotWidth = interpolate(scrollX.value, [(index - 1) * width, width * index, (index + 1) * width], [8, 16, 8], Extrapolation.CLAMP)
                        
                        return { width: dotWidth }
                    })

                    return (
                        <Animated.View className="bg-[#aaa]" key={index} style={[{height:8, width: 8, marginHorizontal:2, borderRadius:8, backgroundColor: paginationIndex === index ? 'white' : '#aaa'},pgAnimationStyle]}/>
                    )
                })
            }
        </View>
    )
}

export default Carousel