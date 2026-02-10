import "react-native-gesture-handler";
import "./global.css";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ZonesScreen from "./src/screens/ZonesScreen";
import { ZonesProvider } from "./src/store/zonesStore";

type RootTabParamList = {
  Home: undefined;
  Zones: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ZonesProvider>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView className="flex-1" edges={["top"]}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#111827",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: {
                  borderTopColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                },
              }}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Zones" component={ZonesScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </ZonesProvider>
    </SafeAreaProvider>
  );
}
