"use client";

import { useEffect, useState } from "react";
import { getTemplates, loadTemplate } from "@/services/api";

type Props = {
  setHtml: (html: string) => void;
  setParsedResume: (data: any) => void;
};

export default function TemplateSelector({
  setHtml,
  setParsedResume,
}: Props) {
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // 🔹 Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getTemplates();
        setTemplates(res.templates || []);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    };

    fetchTemplates();
  }, []);

  // 🔹 Handle template selection
  const handleSelect = async (name: string) => {
    try {
      setLoading(true);
      setSelected(name);

      const res = await loadTemplate(name);

      setHtml(res.html);
      setParsedResume(res.parsed);
    } catch (err) {
      console.error("Failed to load template", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Select Resume Template</h3>

      {templates.length === 0 && <p>No templates found</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {templates.map((t) => (
          <button
            key={t}
            onClick={() => handleSelect(t)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: selected === t ? "2px solid #2563eb" : "1px solid #ccc",
              background: selected === t ? "#eff6ff" : "#fff",
              cursor: "pointer",
            }}
          >
            {t.replace(".html", "")}
          </button>
        ))}
      </div>

      {loading && <p>Loading template...</p>}
    </div>
  );
}