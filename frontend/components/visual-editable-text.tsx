"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const BACKEND_GATE_AUTHORIZATION = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

type VisualEditableTextProps = {
  slug: string;
  path: string;
  value: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3";
};

export function VisualEditableText({
  slug,
  path,
  value,
  className,
  placeholder,
  multiline = false,
  as = "div",
}: VisualEditableTextProps) {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit_mode") === "1";
  const adminToken = searchParams.get("admin_token");
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const sharedStyle = useMemo<CSSProperties | undefined>(() => {
    if (!editMode || !adminToken) {
      return undefined;
    }
    return {
      outline: "1px dashed rgba(17, 122, 115, 0.35)",
      outlineOffset: "6px",
      borderRadius: "12px",
      cursor: "text",
    };
  }, [adminToken, editMode]);

  async function handleBlur() {
    if (!editMode || !adminToken || draft === value) {
      return;
    }
    setSaving(true);
    setSaveError(false);
    try {
      await fetch(`${API_BASE}/api/v1/admin/content-sync`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
          ...(BACKEND_GATE_AUTHORIZATION ? { "X-Gate-Authorization": BACKEND_GATE_AUTHORIZATION } : {}),
        },
        body: JSON.stringify({ slug, path, value: draft }),
      });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  const Tag = as;

  if (!editMode || !adminToken) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }

  return (
    <div className="v3-visual-editable-shell">
      <Tag
        className={className}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => setDraft(event.currentTarget.textContent ?? "")}
        onBlur={() => void handleBlur()}
        style={sharedStyle}
        data-editable-path={path}
      >
        {draft || placeholder}
      </Tag>
      <span className="v3-visual-editable-badge">
        {saving ? "Syncing..." : saveError ? "Retry" : draft !== value ? "Draft" : "Editable"}
      </span>
    </div>
  );
}
