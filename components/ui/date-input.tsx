// import { AppColors } from "@/constants/theme";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import React, { useState } from "react";
// import {
//   Modal,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// interface DateInputProps {
//   label?: string;
//   value?: Date | null;
//   onChange?: (date: Date) => void;
//   error?: string;
//   placeholder?: string;
//   maximumDate?: Date;
//   minimumDate?: Date;
// }

// export function DateInput({
//   label,
//   value,
//   onChange,
//   error,
//   placeholder = "Select date",
//   maximumDate,
//   minimumDate,
// }: DateInputProps) {
//   const [showPicker, setShowPicker] = useState(false);

//   const formatDate = (date: Date | null | undefined): string => {
//     if (!date) return placeholder;
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const handleDateChange = (event: any, selectedDate?: Date) => {
//     if (Platform.OS === "android") {
//       setShowPicker(false);
//       if (event.type === "set" && selectedDate && onChange) {
//         onChange(selectedDate);
//       }
//     } else {
//       // iOS - update date as user scrolls
//       if (selectedDate && onChange) {
//         onChange(selectedDate);
//       }
//     }
//   };

//   const handleIOSDone = () => {
//     setShowPicker(false);
//   };

//   const openPicker = () => {
//     setShowPicker(true);
//   };

//   return (
//     <View style={styles.container}>
//       {label && <Text style={styles.label}>{label}</Text>}
//       <TouchableOpacity
//         style={[
//           styles.inputContainer,
//           error && styles.inputContainerError,
//         ]}
//         onPress={openPicker}
//         activeOpacity={0.8}
//       >
//         <Text
//           style={[
//             styles.inputText,
//             !value && styles.placeholderText,
//           ]}
//         >
//           {formatDate(value)}
//         </Text>
//         <Ionicons
//           name="calendar-outline"
//           size={20}
//           color={AppColors.textSecondary}
//         />
//       </TouchableOpacity>
//       {error && <Text style={styles.errorText}>{error}</Text>}
//       {Platform.OS === "ios" && showPicker ? (
//         <Modal
//           visible={showPicker}
//           transparent
//           animationType="slide"
//           onRequestClose={handleIOSDone}
//         >
//           <Pressable
//             style={styles.modalOverlay}
//             onPress={handleIOSDone}
//           >
//             <View style={styles.iosModalContent}>
//               <View style={styles.iosPickerHeader}>
//                 <TouchableOpacity onPress={handleIOSDone}>
//                   <Text style={styles.iosCancelText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.iosTitleText}>Select Date</Text>
//                 <TouchableOpacity onPress={handleIOSDone}>
//                   <Text style={styles.iosDoneText}>Done</Text>
//                 </TouchableOpacity>
//               </View>
//               <DateTimePicker
//                 value={value || new Date()}
//                 mode="date"
//                 display="spinner"
//                 onChange={handleDateChange}
//                 maximumDate={maximumDate}
//                 minimumDate={minimumDate}
//                 themeVariant="dark"
//               />
//             </View>
//           </Pressable>
//         </Modal>
//       ) : (
//         showPicker && (
//           <DateTimePicker
//             value={value || new Date()}
//             mode="date"
//             display="default"
//             onChange={handleDateChange}
//             maximumDate={maximumDate}
//             minimumDate={minimumDate}
//             themeVariant="dark"
//           />
//         )
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 20,
//   },
//   label: {
//     fontWeight: "500",
//     fontSize: 14,
//     color: AppColors.text,
//     marginBottom: 12,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "transparent",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: AppColors.border,
//     paddingHorizontal: 16,
//     minHeight: 56,
//   },
//   inputContainerError: {
//     borderColor: AppColors.error,
//   },
//   inputText: {
//     flex: 1,
//     fontSize: 14,
//     color: AppColors.text,
//     paddingVertical: 16,
//   },
//   placeholderText: {
//     color: AppColors.textMuted,
//   },
//   errorText: {
//     fontSize: 12,
//     color: AppColors.error,
//     marginTop: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   iosModalContent: {
//     backgroundColor: AppColors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 40,
//   },
//   iosPickerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: AppColors.border,
//   },
//   iosCancelText: {
//     fontSize: 16,
//     color: AppColors.textSecondary,
//   },
//   iosTitleText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: AppColors.text,
//   },
//   iosDoneText: {
//     fontSize: 16,
//     color: AppColors.primary,
//     fontWeight: "600",
//   },
// });

