import { View, Text, Image, Dimensions, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import React, { useRef, useState, useContext, useEffect } from "react";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { TemplateContext } from "../../../app/itinerary/_layout";
import axiosInstance from "../../utils/axios";
import { CheckCircleIcon } from "react-native-heroicons/solid";

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
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading Templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.sectionTitle}>Choose a Template</Text> */}
      
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
      
     
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Selected: {selectedTemplate ? selectedTemplate.name : "None"}
        </Text>
      </View>
    </View>
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
      <TouchableOpacity 
        onPress={onSelect}
        style={styles.templateCard}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.imageContainer,
            isSelected ? styles.selectedImageContainer : null,
          ]}
        >
          <Image source={item.previewImage} style={styles.previewImage} />
          
          {isSelected && (
            <View style={styles.selectedBadge}>
              <CheckCircleIcon size={24} color="#10b981" />
            </View>
          )}
        </View>
        
        <Text style={styles.titleText}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.descriptionText}>
            {item.description}
          </Text>
        )}
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
                { backgroundColor: paginationIndex === index ? "#10b981" : "#374151" },
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
export default ItineraryTemplatesScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070f1b",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 24,
    marginTop: 24,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070f1b",
  },
  loadingText: {
    color: "white",
    // marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  sliderItemContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  templateCard: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  imageContainer: {
    width: 280,
    height: 420,
    borderWidth: 2,
    borderColor: "#1c2536",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1c2536",
    marginTop: 24,
  },
  selectedImageContainer: {
    borderColor: "#10b981",
    borderWidth: 3,
  },
  selectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#151f32",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginTop: 16,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  paginationDot: {
    height: 8,
    marginHorizontal: 3,
    borderRadius: 4,
  },
  noTemplatesText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  selectionInfo: {
    backgroundColor: "#1e3a5f",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  selectionText: {
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
});
