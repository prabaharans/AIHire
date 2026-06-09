import { useState } from "react";

export const useExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (
    endpoint: string,
    format: "csv" | "json" = "csv",
    filename?: string,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}${endpoint}`);
      url.searchParams.append("format", format);

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url_obj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url_obj;
      a.download =
        filename || `export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_obj);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return { exportData, loading, error };
};
