import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo } from "react";
import { AppState, Linking, Pressable, ScrollView, Text, View } from "react-native";
import NoiseGauge from "../components/NoiseGauge";
import { useZones } from "../store/zonesStore";
import {
  SUGGESTION_TEXT,
  getLoudnessStatus,
  getStatusColor,
  useNoiseMeter,
} from "../utils/noise";

type HomeScreenProps = {
  navigation: {
    navigate: (screen: "Zones") => void;
  };
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    orderedZones,
    currentZoneId,
    currentZone,
    setCurrentZone,
    toggleFavorite,
  } = useZones();
  const { db, permission, start, stop } = useNoiseMeter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (isActive) {
          await start();
        }
      })();
      return () => {
        isActive = false;
        stop();
      };
    }, [start, stop])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        start();
      } else {
        stop();
      }
    });
    return () => subscription.remove();
  }, [start, stop]);

  const status = useMemo(() => getLoudnessStatus(db), [db]);
  const statusColor = useMemo(() => getStatusColor(status), [status]);
  const permissionDenied = permission !== null && !permission.granted;

  return (
    <View className="flex-1 gap-4 bg-[#F6F6F4] p-4">
      <Text className="text-2xl font-semibold text-[#111827]">Gym Noise Buddy</Text>

      <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-[#111827]">Noise Meter</Text>
        <Text className="text-[40px] font-bold text-[#111827]">
          {db === null ? "--" : `~${db.toFixed(0)} dB`}
        </Text>
        <Text className="text-xs text-[#6B7280]">
          Approximate dB based on mic level, not a calibrated instrument.
        </Text>
        <NoiseGauge db={db} status={status} />

        {permissionDenied ? (
          <View className="gap-2.5 rounded-xl bg-[#FEF2F2] p-3">
            <Text className="text-[13px] text-[#991B1B]">
              Microphone access is required to measure noise levels.
            </Text>
            <Pressable
              className="self-start rounded-[10px] bg-[#111827] px-4 py-2.5"
              onPress={() => Linking.openSettings()}
            >
              <Text className="text-[13px] font-semibold text-white">Open Settings</Text>
            </Pressable>
          </View>
        ) : (
          <View
            className="gap-1.5 rounded-xl border bg-[#F9FAFB] p-3"
            style={{ borderColor: statusColor }}
          >
            <Text className="text-sm font-semibold text-[#111827]">
              {status === "loud" ? "Too loud for focus" : "Noise level OK"}
            </Text>
            <Text className="text-[13px] text-[#4B5563]">
              {status === "loud" ? SUGGESTION_TEXT : "Keep the zone, or switch for variety."}
            </Text>
          </View>
        )}
      </View>

      <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-base font-semibold text-[#111827]">Current Zone</Text>
          {currentZone ? (
            <Pressable
              className={`rounded-[10px] border px-3 py-1.5 ${
                currentZone.isFavorite ? "border-[#111827] bg-[#111827]" : "border-[#D1D5DB]"
              }`}
              onPress={() => toggleFavorite(currentZone.id)}
            >
              <Text
                className={`text-xs ${
                  currentZone.isFavorite ? "text-white" : "text-[#111827]"
                }`}
              >
                {currentZone.isFavorite ? "Unfavorite" : "Favorite"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {orderedZones.length === 0 ? (
          <View className="gap-2.5">
            <Text className="text-sm text-[#4B5563]">No zones yet. Add your favorite gym spots.</Text>
            <Pressable
              className="self-start rounded-[10px] bg-[#111827] px-4 py-2.5"
              onPress={() => navigation.navigate("Zones")}
            >
              <Text className="text-[13px] font-semibold text-white">Add Zones</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
            {orderedZones.map((zone) => {
              const isSelected = zone.id === currentZoneId;
              return (
                <Pressable
                  key={zone.id}
                  className={`mr-2.5 rounded-full border px-3.5 py-2 ${
                    isSelected
                      ? "border-[#111827] bg-[#111827]"
                      : "border-[#D1D5DB] bg-white"
                  }`}
                  onPress={() => setCurrentZone(zone.id)}
                >
                  <Text className={`text-[13px] ${isSelected ? "text-white" : "text-[#111827]"}`}>
                    {zone.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
