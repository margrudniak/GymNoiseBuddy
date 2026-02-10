import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";
import React, { useCallback, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { THRESHOLDS } from "../utils/noise";

export default function SettingsScreen() {
  const [permissionStatus, setPermissionStatus] = useState<string>("Checking...");
  const [isDenied, setIsDenied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        const status = await Audio.getPermissionsAsync();
        if (!isActive) {
          return;
        }
        setPermissionStatus(status.granted ? "Granted" : status.canAskAgain ? "Not granted" : "Denied");
        setIsDenied(!status.granted);
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View className="flex-1 gap-4 bg-[#F6F6F4] p-4">
      <Text className="text-2xl font-semibold text-[#111827]">Settings</Text>

      <View className="gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-[#111827]">Microphone Permission</Text>
        <Text className="text-[13px] text-[#4B5563]">Status: {permissionStatus}</Text>
        {isDenied ? (
          <Pressable
            className="mt-1 self-start rounded-[10px] bg-[#111827] px-4 py-2.5"
            onPress={() => Linking.openSettings()}
          >
            <Text className="text-[13px] font-semibold text-white">Open Settings</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-[#111827]">Noise Thresholds</Text>
        <Text className="text-[13px] text-[#4B5563]">Quiet: {THRESHOLDS.quietMax} dB or lower</Text>
        <Text className="text-[13px] text-[#4B5563]">
          OK: {THRESHOLDS.quietMax + 1}-{THRESHOLDS.okMax} dB
        </Text>
        <Text className="text-[13px] text-[#4B5563]">Loud: above {THRESHOLDS.okMax} dB</Text>
      </View>

      <View className="gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-[#111827]">Disclaimer</Text>
        <Text className="text-[13px] text-[#4B5563]">
          Approximate dB based on mic level, not a calibrated instrument. Use the trend rather
          than the absolute number.
        </Text>
      </View>
    </View>
  );
}
