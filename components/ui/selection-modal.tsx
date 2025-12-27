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
  enableSearch?: boolean;
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
  enableSearch = true,
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
              <Ionicons name="close" size={18} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {enableSearch ? (
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
                    size={16}
                    color={AppColors.textSecondary}
                  />
                }
              />
            </View>
          ) : null}

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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    marginBottom: 0,
  },
  list: {
    maxHeight: 300,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
});
