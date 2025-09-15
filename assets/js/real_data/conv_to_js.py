import json
from collections import defaultdict

def build_agricultural_data(data, output_file="agriculturalData.js"):
    # Prepare structure
    agricultural_data = defaultdict(lambda: {
        "name": None,
        #"icon": "🌱",  # placeholder, can be mapped per crop
        #"color": "#4caf50",  # placeholder
        "avgEfficiency": None,
        "productionPerTon": None,
        "productionData": [],
        "amountData": [],
        "currentProduction": None,
        "lastYearProduction": None,
        "varieties": []
    })

    # Temporary accumulators
    totals = defaultdict(lambda: {"production": 0, "area": 0})

    # Fill structure
    for entry in data:
        crop_name = entry.get("crop_name", "Unknown")
        crop_block = agricultural_data[crop_name]
        crop_block["name"] = crop_name

        harvested = entry.get("harvested_weight") or 0
        area = entry.get("area_hectare") or 0

        # accumulate totals
        totals[crop_name]["production"] += harvested
        totals[crop_name]["area"] += area

        # Add variety info
        crop_block["varieties"].append({
            "name": entry.get("variety") or entry.get("seed_name") or crop_name,
            "location": [entry.get("lat"), entry.get("long")],
            "total": harvested,
            "avg": entry.get("yield_per_fed") or 0
            #"color": "#8bc34a"  # placeholder
        })

    # Finalize totals and averages
    for crop_name, crop_block in agricultural_data.items():
        total_production = totals[crop_name]["production"]
        tillable_area = totals[crop_name]["area"]
        avg_efficiency = total_production / tillable_area if tillable_area else 0

        crop_block["productionPerTon"] = total_production
        crop_block["avgEfficiency"] = avg_efficiency

    # Export to JS file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("export const agriculturalData = ")
        json.dump(agricultural_data, f, indent=4, ensure_ascii=False)
        f.write(";")

    print(f"✅ Agricultural data exported to {output_file}")

    return agricultural_data

# Example usage:
from api_connection import data

agricultural_data = build_agricultural_data(data)
