from __future__ import annotations

import posixpath
import re
import zipfile
from io import BytesIO
from xml.etree import ElementTree as ET


_NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def _column_index(cell_reference: str) -> int:
    match = re.match(r"([A-Z]+)", cell_reference.upper())
    if not match:
        return 0
    value = 0
    for character in match.group(1):
        value = value * 26 + (ord(character) - 64)
    return value - 1


def _load_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for node in root.findall("main:si", _NS):
        parts = [text_node.text or "" for text_node in node.findall(".//main:t", _NS)]
        values.append("".join(parts))
    return values


def _resolve_sheet_path(archive: zipfile.ZipFile, sheet_name: str | None) -> tuple[str, str]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    relationship_map = {
        node.attrib["Id"]: node.attrib["Target"]
        for node in rels.findall("pkgrel:Relationship", _NS)
        if node.attrib.get("Target")
    }
    sheets = workbook.findall("main:sheets/main:sheet", _NS)
    if not sheets:
        raise ValueError("Workbook does not contain sheets")

    selected = None
    if sheet_name:
        for sheet in sheets:
            if sheet.attrib.get("name") == sheet_name:
                selected = sheet
                break
        if selected is None:
            raise ValueError(f"Worksheet '{sheet_name}' not found in workbook")
    else:
        selected = sheets[0]

    relationship_id = selected.attrib.get(f"{{{_NS['rel']}}}id")
    if not relationship_id or relationship_id not in relationship_map:
        raise ValueError("Worksheet relationship is missing from workbook")

    target = relationship_map[relationship_id].replace("\\", "/")
    if target.startswith("/"):
        target = target.lstrip("/")
    if not target.startswith("xl/"):
        target = posixpath.normpath(posixpath.join("xl", target))
    return selected.attrib.get("name", "Sheet1"), target


def _extract_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value_node = cell.find("main:v", _NS)

    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//main:t", _NS)).strip()
    if value_node is None:
        return ""
    raw_value = value_node.text or ""
    if cell_type == "s":
        try:
            return shared_strings[int(raw_value)].strip()
        except (ValueError, IndexError):
            return raw_value.strip()
    return raw_value.strip()


def read_xlsx_rows(
    content: bytes,
    *,
    sheet_name: str | None = None,
    header_row: int | None = None,
    required_headers: set[str] | None = None,
) -> list[dict[str, str]]:
    with zipfile.ZipFile(BytesIO(content)) as archive:
        shared_strings = _load_shared_strings(archive)
        _, worksheet_path = _resolve_sheet_path(archive, sheet_name)
        worksheet = ET.fromstring(archive.read(worksheet_path))

    row_values: list[tuple[int, list[str]]] = []
    for row in worksheet.findall(".//main:sheetData/main:row", _NS):
        row_number = int(row.attrib.get("r", "0") or 0)
        cells: dict[int, str] = {}
        max_index = -1
        for cell in row.findall("main:c", _NS):
            reference = cell.attrib.get("r", "")
            index = _column_index(reference)
            cells[index] = _extract_cell_value(cell, shared_strings)
            max_index = max(max_index, index)
        if max_index < 0:
            continue
        values = [cells.get(index, "") for index in range(max_index + 1)]
        row_values.append((row_number, values))

    if not row_values:
        return []

    header_index = 0
    if header_row is not None:
        for index, (row_number, _) in enumerate(row_values):
            if row_number == header_row:
                header_index = index
                break
    elif required_headers:
        normalized_required = {item.lower() for item in required_headers}
        for index, (_, values) in enumerate(row_values):
            normalized = {value.strip().lower() for value in values if value.strip()}
            if normalized_required.issubset(normalized):
                header_index = index
                break

    headers = [value.strip() for value in row_values[header_index][1]]
    rows: list[dict[str, str]] = []
    for _, values in row_values[header_index + 1 :]:
        if not any(value.strip() for value in values):
            continue
        row = {
            headers[index].strip(): values[index].strip()
            for index in range(min(len(headers), len(values)))
            if headers[index].strip()
        }
        if row:
            rows.append(row)
    return rows
