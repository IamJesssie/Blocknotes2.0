"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#1e293b",
          "--normal-text": "#f1f5f9",
          "--normal-border": "#334155",
          "--success-bg": "#064e3b",
          "--success-text": "#10b981",
          "--success-border": "#047857",
          "--error-bg": "#7f1d1d",
          "--error-text": "#ef4444",
          "--error-border": "#b91c1c",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
