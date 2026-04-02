from __future__ import annotations

from pathlib import Path

from app.scripts.export_contract_docs_to_docx import export_markdown_to_docx


ROOT = Path(__file__).resolve().parents[3]
STATUS_DIR = ROOT / "docs" / "status"

DOC_SOURCES = [
    "mydarrin-executive-report-march-2026.md",
    "mydarrin-rag-status-march-2026.md",
    "mydarrin-investor-backoffice-status-march-2026.md",
]


def main() -> None:
    for file_name in DOC_SOURCES:
        source = STATUS_DIR / file_name
        if not source.exists():
            print(f"SKIP missing {source}")
            continue
        output = export_markdown_to_docx(source)
        print(f"OK {output}")


if __name__ == "__main__":
    main()
