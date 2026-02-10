import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DB_MAX, DB_MIN, Loudness, getStatusColor } from "../utils/noise";

type NoiseGaugeProps = {
  db: number | null;
  status: Loudness;
};

export default function NoiseGauge({ db, status }: NoiseGaugeProps) {
  const percent = db === null ? 0 : ((db - DB_MIN) / (DB_MAX - DB_MIN)) * 100;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const indicatorLeft = `${clampedPercent}%`;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.segment, styles.quiet]} />
        <View style={[styles.segment, styles.ok]} />
        <View style={[styles.segment, styles.loud]} />
        <View style={[styles.indicator, { left: indicatorLeft, backgroundColor: getStatusColor(status) }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>Quiet</Text>
        <Text style={styles.label}>Ok</Text>
        <Text style={styles.label}>Loud</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    position: "relative",
  },
  segment: {
    flex: 1,
  },
  quiet: {
    backgroundColor: "#1E8E3E",
  },
  ok: {
    backgroundColor: "#F6C343",
  },
  loud: {
    backgroundColor: "#D93025",
  },
  indicator: {
    position: "absolute",
    width: 3,
    height: 20,
    top: -4,
    marginLeft: -1.5,
    borderRadius: 2,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: "#4B5563",
  },
});
