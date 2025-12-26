import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectionModalProps<T> {
  visible: boolean;
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  items: T[];
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  onSelect: (item: T) => void;
  onClose: () => void;
  getItemKey: (item: T) => string;
  getIsSelected?: (item: T) => boolean;
  emptyText?: string;
  searchPlaceholder?: string;
}

export function SelectionModal<T>({
  visible,
  title,
  searchQuery,
  onSearchChange,
  items,
  renderItem,
  onSelect,
  onClose,
  getItemKey,
  getIsSelected,
  emptyText = "No items found",
  searchPlaceholder = "Search...",
}: SelectionModalProps<T>) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              style={styles.searchInput}
              placeholderTextColor={AppColors.textSecondary}
              leftIcon={
                <Ionicons
                  name="search"
                  size={20}
                  color={AppColors.textSecondary}
                />
              }
            />
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={getItemKey}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = getIsSelected ? getIsSelected(item) : false;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    {renderItem(item, isSelected)}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  list: {
    maxHeight: 400,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
});

