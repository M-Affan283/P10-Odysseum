import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import ActionSheet from "react-native-actions-sheet";
import { Calendar } from "react-native-calendars";
import { XMarkIcon } from "react-native-heroicons/outline";

const CalendarModal = ({ visible, setVisible, setDate, mode = "default" }) => {
  const actionSheetRef = React.useRef();
  const [selectedDate, setSelectedDate] = useState(null);

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  }, [visible]);

  const onDayPress = (day) => {
    // day contains object of this type example:
    // {"dateString": "2025-02-22", "day": 22, "month": 2, "timestamp": 1740182400000, "year": 2025}
    // to conver tot date object use new Date(day.timestamp)
    console.log(`Selected date in ${mode} mode:`, day);
    // console.log(new Date(day.timestamp));
    setSelectedDate(new Date(day.timestamp));
    setDate(new Date(day.timestamp));
  };

  return (
    <View className="flex-1">
      <ActionSheet
        // #070f1b
        ref={actionSheetRef}
        containerStyle={{
          backgroundColor: "#070f1b",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: "90%",
        }}
        indicatorStyle={{
          width: 50,
          marginVertical: 10,
          backgroundColor: "white",
        }}
        gestureEnabled={true} //check if disabling this and adding a cancel button is better UI
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <View className="flex-row items-center justify-between gap-x-3">
          <Text className="text-white text-3xl font-dsbold p-4 mt-2">
            Select Date {mode !== "default" ? `(${mode})` : ""}
          </Text>

          <TouchableOpacity onPress={onClose} className="p-0.5">
            <XMarkIcon size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View className="justify-center bg-[#101f36] rounded-2xl h-[65%]">
          <Calendar
            enableSwipeMonths
            firstDay={1}
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate?.toISOString().slice(0, 10)]: {
                selected: true,
                selectedColor: "#b919e7",
              },
            }}
            theme={{
              calendarBackground: "#101f36",
              textSectionTitleColor: "white",
              textSectionTitleDisabledColor: "pink",
              dayTextColor: "white",
              todayTextColor: "white",
              todayBackgroundColor: "blue",
              selectedDayTextColor: "white",
              monthTextColor: "white",
              indicatorColor: "white",
              arrowColor: "white",
              textDisabledColor: "gray",
              stylesheet: {
                calendar: {
                  header: {
                    week: {
                      marginTop: 30,
                      marginHorizontal: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    },
                  },
                },
              },
            }}
          />
        </View>

        <View className="flex-row justify-center items-center gap-x-4 mt-4">
          <Text className="text-white text-lg">Selected Date: </Text>
          <Text className="text-white text-lg">
            {selectedDate?.toDateString()}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-[#8C00E3] mx-auto w-1/2 min-h-[50px] rounded-md flex-row justify-center items-center mt-5"
          onPress={onClose}
        >
          <Text className={`text-white font-semibold text-lg`}>Confirm</Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
};

export default CalendarModal;
