import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TextSize = "small" | "default" | "large" | "xlarge";

interface TextSizeContextValue {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

const STORAGE_KEY = "sideline-text-size";

const SCALE: Record<TextSize, string> = {
  small: "87.5%",
  default: "100%",
  large: "112.5%",
  xlarge: "125%",
};

function applyTextSize(size: TextSize) {
  if (typeof document !== "undefined") {
    document.documentElement.style.fontSize = SCALE[size];
  }
}

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("default");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as TextSize | null;
    const initial: TextSize =
      stored && stored in SCALE ? stored : "default";
    setTextSizeState(initial);
    applyTextSize(initial);
  }, []);

  const setTextSize = useCallback((next: TextSize) => {
    setTextSizeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTextSize(next);
  }, []);

  const value = useMemo(() => ({ textSize, setTextSize }), [textSize, setTextSize]);

  return (
    <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error("useTextSize must be used within TextSizeProvider");
  return ctx;
}
