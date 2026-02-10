import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Zone = {
  id: string;
  name: string;
  notes?: string;
  isFavorite: boolean;
};

type ZonesState = {
  zones: Zone[];
  currentZoneId: string | null;
  loaded: boolean;
};

type ZonesContextValue = {
  zones: Zone[];
  orderedZones: Zone[];
  currentZoneId: string | null;
  currentZone: Zone | null;
  addZone: (name: string, notes?: string) => void;
  updateZone: (id: string, name: string, notes?: string) => void;
  deleteZone: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setCurrentZone: (id: string) => void;
};

const STORAGE_KEY = "gymNoiseBuddy.zones.v1";

const ZonesContext = createContext<ZonesContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortZones(zones: Zone[]) {
  return [...zones].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function pickDefaultZoneId(zones: Zone[]) {
  if (zones.length === 0) {
    return null;
  }
  const favorite = zones.find((zone) => zone.isFavorite);
  return favorite ? favorite.id : zones[0].id;
}

export function ZonesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ZonesState>({
    zones: [],
    currentZoneId: null,
    loaded: false,
  });

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          if (isActive) {
            setState((prev) => ({ ...prev, loaded: true }));
          }
          return;
        }
        const parsed = JSON.parse(raw) as {
          zones?: Zone[];
          currentZoneId?: string | null;
        };
        const zones = Array.isArray(parsed.zones) ? parsed.zones : [];
        const currentZoneId =
          parsed.currentZoneId && zones.some((zone) => zone.id === parsed.currentZoneId)
            ? parsed.currentZoneId
            : pickDefaultZoneId(zones);
        if (isActive) {
          setState({ zones, currentZoneId, loaded: true });
        }
      } catch {
        if (isActive) {
          setState((prev) => ({ ...prev, loaded: true }));
        }
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.loaded) {
      return;
    }
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ zones: state.zones, currentZoneId: state.currentZoneId })
    ).catch(() => {
      // Ignore persistence errors for now.
    });
  }, [state.zones, state.currentZoneId, state.loaded]);

  const addZone = useCallback((name: string, notes?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const trimmedNotes = notes?.trim();
    const newZone: Zone = {
      id: createId(),
      name: trimmedName,
      notes: trimmedNotes ? trimmedNotes : undefined,
      isFavorite: false,
    };
    setState((prev) => {
      const zones = [...prev.zones, newZone];
      const currentZoneId = prev.currentZoneId ?? newZone.id;
      return { ...prev, zones, currentZoneId };
    });
  }, []);

  const updateZone = useCallback((id: string, name: string, notes?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const trimmedNotes = notes?.trim();
    setState((prev) => ({
      ...prev,
      zones: prev.zones.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              name: trimmedName,
              notes: trimmedNotes ? trimmedNotes : undefined,
            }
          : zone
      ),
    }));
  }, []);

  const deleteZone = useCallback((id: string) => {
    setState((prev) => {
      const zones = prev.zones.filter((zone) => zone.id !== id);
      const currentZoneId =
        prev.currentZoneId === id ? pickDefaultZoneId(zones) : prev.currentZoneId;
      return { ...prev, zones, currentZoneId };
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      zones: prev.zones.map((zone) =>
        zone.id === id ? { ...zone, isFavorite: !zone.isFavorite } : zone
      ),
    }));
  }, []);

  const setCurrentZone = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.zones.some((zone) => zone.id === id)) {
        return prev;
      }
      return { ...prev, currentZoneId: id };
    });
  }, []);

  const orderedZones = useMemo(() => sortZones(state.zones), [state.zones]);
  const currentZone = state.currentZoneId
    ? state.zones.find((zone) => zone.id === state.currentZoneId) || null
    : null;

  const value = useMemo(
    () => ({
      zones: state.zones,
      orderedZones,
      currentZoneId: state.currentZoneId,
      currentZone,
      addZone,
      updateZone,
      deleteZone,
      toggleFavorite,
      setCurrentZone,
    }),
    [
      state.zones,
      orderedZones,
      state.currentZoneId,
      currentZone,
      addZone,
      updateZone,
      deleteZone,
      toggleFavorite,
      setCurrentZone,
    ]
  );

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

export function useZones() {
  const context = useContext(ZonesContext);
  if (!context) {
    throw new Error("useZones must be used within ZonesProvider");
  }
  return context;
}
