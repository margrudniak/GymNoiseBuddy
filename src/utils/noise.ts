import { Audio } from "expo-av";
import { useCallback, useRef, useState } from "react";

export const DB_OFFSET = 100;
export const DB_MIN = 30;
export const DB_MAX = 120;
export const THRESHOLDS = {
  quietMax: 60,
  okMax: 70,
};

export type Loudness = "quiet" | "ok" | "loud";

export const SUGGESTION_TEXT = "Too loud for focus -> ANC / other zone.";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function meteringToDb(metering: number | null | undefined): number | null {
  if (metering === null || metering === undefined) {
    return null;
  }
  return clamp(metering + DB_OFFSET, DB_MIN, DB_MAX);
}

export function getLoudnessStatus(db: number | null): Loudness {
  if (db === null) {
    return "quiet";
  }
  if (db <= THRESHOLDS.quietMax) {
    return "quiet";
  }
  if (db <= THRESHOLDS.okMax) {
    return "ok";
  }
  return "loud";
}

export function getStatusColor(status: Loudness): string {
  switch (status) {
    case "quiet":
      return "#1E8E3E";
    case "ok":
      return "#F6C343";
    case "loud":
      return "#D93025";
    default:
      return "#1E8E3E";
  }
}

export type MicPermission = Awaited<ReturnType<typeof Audio.getPermissionsAsync>>;

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  progressUpdateIntervalMillis: 250,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    audioQuality: Audio.IOSAudioQuality.MIN,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export function useNoiseMeter() {
  const [db, setDb] = useState<number | null>(null);
  const [permission, setPermission] = useState<MicPermission | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const stop = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignore stop errors when recording isn't active.
      }
      recordingRef.current = null;
    }
    setDb(null);
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    if (isRecording) {
      return true;
    }
    if (recordingRef.current) {
      await stop();
    }

    const nextPermission = await Audio.requestPermissionsAsync();
    setPermission(nextPermission);

    if (!nextPermission.granted) {
      await stop();
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording) {
        return;
      }
      if (typeof status.metering === "number") {
        setDb(meteringToDb(status.metering));
      }
    });
    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);
    return true;
  }, [isRecording, stop]);

  return {
    db,
    permission,
    isRecording,
    start,
    stop,
  };
}
