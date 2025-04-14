import { View, Text, Image, Dimensions, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import React, { useRef, useState, useContext, useEffect } from "react";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { TemplateContext } from "../../../app/itinerary/_layout";
import axiosInstance from "../../utils/axios";

const { width } = Dimensions.get("screen");

const ItineraryTemplatesScreen = () => {
  const scrollX = useSharedValue(0);
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedTemplate, setSelectedTemplate } = useContext(TemplateContext);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axiosInstance.get("/itinerary/getTemplates");
        const withTemplates = response.data.map((data) => ({
          ...data,
          previewImage: { uri: data.previewImage },
        }));
        setTemplates(withTemplates);
      } catch (error) {
        console.log("Failed to retrieve templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff99" />
        <Text style={styles.loadingText}>Loading Templates...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.screen}>
        <Animated.FlatList
          data={templates}
          renderItem={({ item, index }) => (
            <SliderItem
              item={item}
              index={index}
              scrollX={scrollX}
              onSelect={() => setSelectedTemplate(item)}
              isSelected={selectedTemplate?.template_id === item.template_id}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={onScrollHandler}
          removeClippedSubviews={false}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          style={{ width: width }}
        />
      </View>
      <Pagination
        items={templates}
        paginationIndex={paginationIndex}
        scrollX={scrollX}
      />
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
    <Animated.View style={[styles.sliderItemContainer, rnAnimatedStyle]}>
      <TouchableOpacity onPress={onSelect}>
        <View
          style={[
            styles.imageContainer,
            { borderColor: isSelected ? "green" : "black" },
          ]}
        >
          <Image source={item.previewImage} style={styles.previewImage} />
        </View>
        <Text style={styles.titleText}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Pagination = ({ items = [], paginationIndex, scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
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
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: paginationIndex === index ? "white" : "#aaa" },
                pgAnimationStyle,
              ]}
            />
          );
        })
      ) : (
        <Text style={styles.noTemplatesText}>No templates available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
  sliderItemContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  imageContainer: {
    width: 250,
    height: 400,
    borderWidth: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  paginationDot: {
    height: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: "#aaa",
  },
  noTemplatesText: {
    color: "white",
  },
});

export default ItineraryTemplatesScreen;