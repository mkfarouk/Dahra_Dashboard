import requests
import json
import os
from collections import defaultdict
from datetime import datetime

with open('data.json','r',encoding='utf-8') as f:
    data= json.load(f)


def safe_parse_date(date_str, fmt="%Y-%m-%d"):
    """Safely parse a date string, return None if missing or invalid."""
    if date_str and isinstance(date_str, str):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            return None
    return None
def build_project_summary(data):
    """
    Build summary json for projects (Toshka, Oweinat) and add an 'All' aggregate.
    """
    projects = {
        "Toshka project": [
            'Date palm','Pump station 1','Pump station 2','Pump station 3',
            'Pump station 4','Pump station 5','Pump station 6','Pump station 7',
            'Pump station 8','Pump station 9'
        ],
        "East Oweinat Project": ['Unit 3','Unit 13']
    }
   
    result = {}
 
    for project_name, group_fields in projects.items():
        project_production = 0
        project_eff_sum = 0
        project_eff_count = 0
        group_field_data = {}
 
        for gf in group_fields:
            gf_production = 0
            gf_eff_sum = 0
            gf_eff_count = 0
            crops = defaultdict(lambda: {"total_production": 0, "total_area": 0, "avg_efficiency": 0, "varieties": []})
 
            for rec in data:
                if rec["group_folder_name"] == project_name and rec["group_field_name"] == gf:
                    # safely handle date
                    harvesting_date = safe_parse_date(rec.get("harvesting_date"))
                   
                    crop = rec["crop_name"]
                    variety = rec["variety"]
                    production = rec["harvested_weight"]
                    area = rec["area_hectare"] if 'area_hectare' in rec and rec['area_hectare'] else 0
                    eff = rec["productivity"] * 0.042
 
                    # accumulate group_field
                    gf_production += production
                    if eff > 0:
                        gf_eff_sum += eff
 
                    # accumulate crop inside group_field
                    crops[crop]["total_production"] += production
                    crops[crop]["total_area"] += area
                    crops[crop]["varieties"].append({
                        "variety": variety,
                        "total_production": production,
                        "total_area": area,
                        "avg_efficiency": eff
                    })
 
            # avg efficiency for group_field
            gf_avg_eff = gf_eff_sum / gf_eff_count if gf_eff_count > 0 else 0
            group_field_data[gf] = {
                "crop_production": gf_production,
                "crop_avg_efficiency": gf_avg_eff,
                "crops": crops
            }
 
            # accumulate to project
            project_production += gf_production
            project_eff_sum += gf_eff_sum
            project_eff_count += gf_eff_count
 
        project_avg_eff = project_production * 0.042
        result[project_name] = {
            "production": project_production,
            "avg_efficiency": project_avg_eff,
            "group_fields": group_field_data
        }
 
    # Add "All"
    all_production = sum(v["production"] for v in result.values())
    effs = [v["avg_efficiency"] for v in result.values() if v["avg_efficiency"] > 0]
    all_avg_eff = sum(effs) * 0.042
    result["All"] = {
        "production": all_production,
        "avg_efficiency": all_avg_eff,
        "group_fields": {}
    }
   
    with open("project_summary.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)
 
    return result


build_project_summary(data)