from app.modules.cost_engine.service import calculate_labor_total


def main() -> None:
    base_rate = 17.4
    zone_multiplier = 1.2
    holiday_multiplier = 2.0
    result = calculate_labor_total(base_rate, zone_multiplier, holiday_multiplier)
    print(f"Total estimat: {result}")


if __name__ == "__main__":
    main()
