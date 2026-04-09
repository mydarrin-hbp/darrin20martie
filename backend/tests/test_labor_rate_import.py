from app.modules.cost_engine.service import calculate_labor_total, parse_labor_rate_row


def test_calculate_labor_total_with_holiday_multiplier():
    result = calculate_labor_total(17.4, 1.1, 2.0)
    assert result == 38.28


def test_parse_labor_rate_row_keeps_diacritics():
    row = {
        "Denumire": "Dulgher montaj acoperiș",
        "Simbol": "741201",
        "Tarif": "17,4",
        "Holiday_multiplier": "2",
    }
    parsed = parse_labor_rate_row(row)
    assert parsed["skill_label"] == "Dulgher montaj acoperiș"
    assert parsed["ro_skill_code"] == "741201"
    assert parsed["skill_code"] == "741201"
