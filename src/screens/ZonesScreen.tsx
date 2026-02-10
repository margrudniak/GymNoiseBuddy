import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Zone, useZones } from "../store/zonesStore";

type EditingState = {
  zone: Zone | null;
  name: string;
  notes: string;
};

export default function ZonesScreen() {
  const {
    orderedZones,
    currentZoneId,
    setCurrentZone,
    addZone,
    updateZone,
    deleteZone,
    toggleFavorite,
  } = useZones();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<EditingState>({ zone: null, name: "", notes: "" });
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditing({ zone: null, name: "", notes: "" });
    setError(null);
    setModalVisible(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditing({ zone, name: zone.name, notes: zone.notes ?? "" });
    setError(null);
    setModalVisible(true);
  };

  const handleSave = () => {
    const name = editing.name.trim();
    if (!name) {
      setError("Zone name is required.");
      return;
    }
    if (editing.zone) {
      updateZone(editing.zone.id, name, editing.notes);
    } else {
      addZone(name, editing.notes);
    }
    setModalVisible(false);
  };

  const handleDelete = (zone: Zone) => {
    Alert.alert("Delete zone?", `Remove ${zone.name} from your list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteZone(zone.id),
      },
    ]);
  };

  const headerText = useMemo(
    () => (orderedZones.length === 0 ? "Add a zone to get started." : "Your gym zones"),
    [orderedZones.length]
  );

  return (
    <View className="flex-1 bg-[#F6F6F4] p-4">
      <View className="mb-2 flex-row items-center justify-between gap-3">
        <Text className="text-2xl font-semibold text-[#111827]">Zones</Text>
        <Pressable className="self-start rounded-[10px] bg-[#111827] px-4 py-2.5" onPress={openAddModal}>
          <Text className="text-[13px] font-semibold text-white">Add Zone</Text>
        </Pressable>
      </View>
      <Text className="mb-3 text-sm text-[#6B7280]">{headerText}</Text>

      <ScrollView contentContainerClassName="gap-3 pb-6">
        {orderedZones.map((zone) => {
          const isSelected = zone.id === currentZoneId;
          return (
            <View key={zone.id} className="gap-2.5 rounded-2xl bg-white p-4 shadow-sm">
              <View className="flex-row justify-between gap-3">
                <Pressable onPress={() => setCurrentZone(zone.id)}>
                  <Text className="text-base font-semibold text-[#111827]">{zone.name}</Text>
                  {zone.notes ? <Text className="mt-1 text-xs text-[#6B7280]">{zone.notes}</Text> : null}
                </Pressable>

                <View className="gap-2">
                  <Pressable
                    className={`rounded-[10px] border px-3 py-1.5 ${
                      isSelected ? "border-[#111827] bg-[#111827]" : "border-[#D1D5DB]"
                    }`}
                    onPress={() => setCurrentZone(zone.id)}
                  >
                    <Text className={`text-xs ${isSelected ? "text-white" : "text-[#111827]"}`}>
                      {isSelected ? "Selected" : "Select"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className={`rounded-[10px] border px-3 py-1.5 ${
                      zone.isFavorite ? "border-[#111827] bg-[#111827]" : "border-[#D1D5DB]"
                    }`}
                    onPress={() => toggleFavorite(zone.id)}
                  >
                    <Text
                      className={`text-xs ${zone.isFavorite ? "text-white" : "text-[#111827]"}`}
                    >
                      {zone.isFavorite ? "Unfavorite" : "Favorite"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="flex-row gap-4">
                <Pressable className="py-1.5" onPress={() => openEditModal(zone)}>
                  <Text className="text-[13px] font-semibold text-[#111827]">Edit</Text>
                </Pressable>
                <Pressable className="py-1.5" onPress={() => handleDelete(zone)}>
                  <Text className="text-[13px] font-semibold text-[#B91C1C]">Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View className="flex-1 justify-center bg-black/40 p-5">
          <View className="gap-3 rounded-2xl bg-white p-5">
            <Text className="text-lg font-semibold text-[#111827]">
              {editing.zone ? "Edit zone" : "Add a new zone"}
            </Text>

            <TextInput
              value={editing.name}
              onChangeText={(value) => setEditing((prev) => ({ ...prev, name: value }))}
              placeholder="Zone name"
              className="rounded-[10px] border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827]"
            />

            <TextInput
              value={editing.notes}
              onChangeText={(value) => setEditing((prev) => ({ ...prev, notes: value }))}
              placeholder="Notes (optional)"
              className="rounded-[10px] border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827]"
              multiline
              style={{ minHeight: 70 }}
            />

            {error ? <Text className="text-xs text-[#B91C1C]">{error}</Text> : null}

            <View className="mt-1 flex-row justify-end gap-3">
              <Pressable className="rounded-[10px] border border-[#D1D5DB] px-3 py-1.5" onPress={() => setModalVisible(false)}>
                <Text className="text-xs text-[#111827]">Cancel</Text>
              </Pressable>
              <Pressable className="rounded-[10px] bg-[#111827] px-4 py-2.5" onPress={handleSave}>
                <Text className="text-[13px] font-semibold text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
