from __future__ import annotations

import argparse
import csv
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


NS = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
}

BASE_URI = "http://data.europa.eu/ux2/nace2.1/"


def infer_level(code: str) -> str:
    if re.fullmatch(r"[A-Z]", code):
        return "section"
    if re.fullmatch(r"\d{2}", code):
        return "division"
    if re.fullmatch(r"\d{2}\.\d", code):
        return "group"
    if re.fullmatch(r"\d{2}\.\d{2}", code):
        return "class"
    return "other"


def normalize_label(value: str, code: str) -> str:
    trimmed = value.strip()
    prefixes = [f"{code} ", f"{code}\u00A0"]
    for prefix in prefixes:
        if trimmed.startswith(prefix):
            return trimmed[len(prefix):].strip()
    return trimmed


def parse_nace_rdf(path: Path) -> list[dict[str, str]]:
    tree = ET.parse(path)
    root = tree.getroot()
    concepts: dict[str, dict[str, object]] = {}

    for description in root.findall("rdf:Description", NS):
        about = description.attrib.get(f"{{{NS['rdf']}}}about")
        if not about or not about.startswith(BASE_URI):
            continue

        concept = concepts.setdefault(
            about,
            {"uri": about, "code": "", "name_ro": "", "name_en": "", "broader_uri": ""},
        )

        notation = description.find("skos:notation", NS)
        if notation is not None and notation.text:
            concept["code"] = notation.text.strip()

        broader = description.find("skos:broader", NS)
        if broader is not None:
            broader_uri = broader.attrib.get(f"{{{NS['rdf']}}}resource", "").strip()
            if broader_uri:
                concept["broader_uri"] = broader_uri

        for label in description.findall("skos:prefLabel", NS):
            lang = label.attrib.get("{http://www.w3.org/XML/1998/namespace}lang")
            text = (label.text or "").strip()
            if not text:
                continue
            if lang == "ro" and not concept["name_ro"]:
                concept["name_ro"] = text
            if lang == "en" and not concept["name_en"]:
                concept["name_en"] = text

    rows: list[dict[str, str]] = []
    for item in concepts.values():
        code = str(item["code"]).strip()
        if not code or code == "NACE 2.1":
            continue
        rows.append(
            {
                "code": code,
                "level": infer_level(code),
                "name_ro": normalize_label(str(item["name_ro"]), code),
                "name_en": normalize_label(str(item["name_en"]), code),
                "uri": str(item["uri"]),
                "broader_uri": str(item["broader_uri"]),
            }
        )
    return sorted(rows, key=lambda row: (row["level"], row["code"]))


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["code", "level", "name_ro", "name_en", "uri", "broader_uri"])
        writer.writeheader()
        writer.writerows(rows)


def write_json(rows: list[dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Parses NACE Rev. 2.1 RDF into CSV/JSON reference files.")
    parser.add_argument("--source", required=True, help="Path to NACE_Rev.2.1.rdf")
    parser.add_argument("--csv-out", default="notes/nace_rev_2_1_reference.csv", help="Output CSV path")
    parser.add_argument("--json-out", default="notes/nace_rev_2_1_reference.json", help="Output JSON path")
    args = parser.parse_args()

    source = Path(args.source)
    rows = parse_nace_rdf(source)
    write_csv(rows, Path(args.csv_out))
    write_json(rows, Path(args.json_out))
    print(f"Parsed {len(rows)} NACE concepts from {source}")
    print(f"CSV => {Path(args.csv_out).resolve()}")
    print(f"JSON => {Path(args.json_out).resolve()}")


if __name__ == "__main__":
    main()
