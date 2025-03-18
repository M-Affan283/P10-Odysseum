import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import React, { useRef, useState, useContext } from "react";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
// import templates from "../utils/templatesData"
import { TemplateContext } from "../../app/itinerary/_layout";

const { width } = Dimensions.get("screen");


// Need to add these templates into database to automatically add and delete templates
const templates = [
    {
        id: 1,
        title: "Simple Template: Blue",
        previewImage: require("../images/Doc1.png")
    }, 
    {
        id: 2,
        title: "Simple Template: Green",
        previewImage: require("../images/Doc2.png")
    }, 
    {
        id: 3,
        title: "Simple Template: Orange",
        previewImage: require("../images/Doc3.png")
    },
];

const ItineraryTemplatesScreen = () => {
    const scrollX = useSharedValue(0);
    const [paginationIndex, setPaginationIndex] = useState(0);
    const { selectedTemplate, setSelectedTemplate } = useContext(TemplateContext)
  
    const onScrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
        scrollX.value = e.contentOffset.x;
        },
    });

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const onViewableItemsChanged = ({ viewableItems }) => {
        if (
        viewableItems &&
        viewableItems.length > 0 &&
        viewableItems[0].index !== undefined &&
        viewableItems[0].index !== null
        ) {
            setPaginationIndex(viewableItems[0].index);
        }
    };

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged },
    ]);

    return (
        <>
        <View className="flex-1 justify-center items-center">
            <Animated.FlatList
            data={templates} // Use templates instead of imagesUri
            renderItem={({ item, index }) => (
                <SliderItem 
                    item={item} 
                    index={index} 
                    scrollX={scrollX} 
                    onSelect={() => setSelectedTemplate(item)}
                    isSelected={selectedTemplate?.id === item.id}
                    />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            onScroll={onScrollHandler}
            removeClippedSubviews={false}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            style={{ width: width }}
            />
        </View>
        <Pagination items={templates} paginationIndex={paginationIndex} scrollX={scrollX} />
        </>
    );
};

const SliderItem = ({ item, index, scrollX, onSelect, isSelected }) => {
    const rnAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: interpolate(
              scrollX.value,
              [(index - 1) * width, width * index, (index + 1) * width],
              [-width * 0.25, 0, width * 0.25],
              Extrapolation.CLAMP
            ),
          },
          {
            scale: interpolate(
              scrollX.value,
              [width * (index - 1), width * index, width * (index + 1)],
              [0.9, 1, 0.9],
              Extrapolation.CLAMP
            ),
          },
        ],
      };
    });
  
    return (
      <Animated.View style={[{ width, justifyContent: "center", alignItems: "center", gap: 20 }, rnAnimatedStyle]}>
        <TouchableOpacity onPress={onSelect}>
            <View
                style={{
                width: 250,
                height: 400,
                borderWidth: 2,
                borderColor: isSelected ? "green" : "black",
                borderRadius: 16,
                overflow: "hidden", 
                }}
            >
                <Image
                source={item.previewImage}
                style={{
                    width: "100%", 
                    height: "100%", 
                    resizeMode: "contain",
                    }}
                />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
};
  

const Pagination = ({ items = [], paginationIndex, scrollX }) => {
    return (
      <View className="flex-row justify-center my-3">
        {items.length > 0 ? (
          items.map((_, index) => {
            const pgAnimationStyle = useAnimatedStyle(() => {
              const dotWidth = interpolate(
                scrollX.value,
                [(index - 1) * width, width * index, (index + 1) * width],
                [8, 16, 8],
                Extrapolation.CLAMP
              );
              return { width: dotWidth };
            });
  
            return (
              <Animated.View
                className="bg-[#aaa]"
                key={index}
                style={[
                  { height: 8, width: 8, marginHorizontal: 2, borderRadius: 8, backgroundColor: paginationIndex === index ? "white" : "#aaa" },
                  pgAnimationStyle,
                ]}
              />
            );
          })
        ) : (
          <Text style={{ color: "white" }}>No templates available</Text>
        )}
      </View>
    );
  };

export default ItineraryTemplatesScreen;
