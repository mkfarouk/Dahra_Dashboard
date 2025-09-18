import requests
import json
import os
from collections import defaultdict
from datetime import datetime

Oweinat=['Unit 3','Unit 13']
Toshka=['Date palm','Pump station 1','Pump station 2','Pump station 3','Pump station 4','Pump station 5','Pump station 6','Pump station 7','Pump station 8','Pump station 9']

url_history = f"https://operations.cropwise.com/api/v3/history_items?year={datetime.now().year}"
url_history_2 = f"https://operations.cropwise.com/api/v3/history_items?year={datetime.now().year - 1}"
url_fields = "https://operations.cropwise.com/api/v3/fields"
url_fields1= "https://operations.cropwise.com/api/v3a/fields"
#url_fields= "https://operations.cropwise.com/fields.json"
url_groupfield="https://operations.cropwise.com/api/v3/field_groups"
url_gfolder='https://operations.cropwise.com/api/v3/group_folders'
url_seeds="https://operations.cropwise.com/api/v3/seeds"
url_crops="https://operations.cropwise.com/api/v3/crops"

token_headers = {'user_api_token': '5SZLxNBxQGCs-xmH7uaH'}

wdir = os.path.join(os.getcwd(),'assets/js')

history_data, crops_data, seeds_data = None, None, None
field_data, field1_data, gfield_data, gfolder_data = None, None, None, None
production_per_ton=0
avg_efficiency=0
total_area=0
data=[]

# ---------------- Get crop related data from the API and save to JSON files ----------------
def get_crops_data():
    
    global history_data, crops_data, seeds_data
    
    history_r = requests.get(url_history,token_headers)
    history_data=history_r.json()
    with open(os.path.join(f'{wdir}\\api_data','history.json'), 'w',encoding='utf-8') as f:
        json.dump(history_data, f,indent=4)

    history_r2 = requests.get(url_history_2,token_headers)
    history_data2 = {'data': history_r2.json()['data']}
    with open(os.path.join(f'{wdir}\\api_data','history2.json'), 'w',encoding='utf-8') as f:
        json.dump(history_data2, f,indent=4)

    history_1_2 = requests.get(url_history_2,token_headers)
    history_data_1_2 = {'data': history_r2.json()['data'] + history_data['data']}
    with open(os.path.join(f'{wdir}\\api_data','history1_2.json'), 'w',encoding='utf-8') as f:
        json.dump(history_data_1_2, f,indent=4)

    seeds_r = requests.get(url_seeds,token_headers)
    seeds_data=seeds_r.json()
    with open(os.path.join(f'{wdir}\\api_data','seeds.json'), 'w',encoding='utf-8') as f:
        json.dump(seeds_data, f,indent=4)   

    crops_r = requests.get(url_crops,token_headers)
    crops_data=crops_r.json()   
    with open(os.path.join(f'{wdir}\\api_data','crops.json'), 'w',encoding='utf-8') as f:
        json.dump(crops_data, f,indent=4)
# ---------------- Get field related data from the API and save to JSON files ----------------
def get_fields_data():
    
    global field_data, field1_data, gfield_data, gfolder_data
   
    field_r = requests.get(url_fields,token_headers)
    field_data=field_r.json()
    with open(os.path.join(f'{wdir}\\api_data','fields.json'), 'w',encoding='utf-8') as f:
        json.dump(field_data, f,indent=4)
    
    field1_r = requests.get(url_fields1,token_headers)
    field1_data=field1_r.json()
    with open(os.path.join(f'{wdir}\\api_data','fields1.json'), 'w',encoding='utf-8') as f:
        json.dump(field1_data, f,indent=4)
    
    gfield_r = requests.get(url_groupfield,token_headers)
    gfield_data=gfield_r.json()
    with open(os.path.join(f'{wdir}\\api_data','gfields.json'), 'w',encoding='utf-8') as f:
        json.dump(gfield_data, f,indent=4)
  
    gfolder_r = requests.get(url_gfolder,token_headers)
    gfolder_data=gfolder_r.json()
    with open(os.path.join(f'{wdir}\\api_data','gfolders.json'), 'w',encoding='utf-8') as f:
        json.dump(gfolder_data, f,indent=4)
# ---------------- Load data from JSON files ----------------
def load_fields_data():
    
    global field_data, field1_data, gfield_data, gfolder_data
    
    with open(os.path.join(f'{wdir}\\api_data','fields.json'), 'r') as f:
        field_data = json.load(f)

    with open(os.path.join(f'{wdir}\\api_data','fields1.json'), 'r') as f:
        field1_data = json.load(f)

    with open(os.path.join(f'{wdir}\\api_data','gfields.json'), 'r') as f:
        gfield_data = json.load(f)
    
    with open(os.path.join(f'{wdir}\\api_data','gfolders.json'), 'r') as f:
        gfolder_data = json.load(f)
    
    return field_data, field1_data, gfield_data, gfolder_data
# ---------------- Create a new data structure by merging relevant information ----------------
def gather_crop_data(history_data, crops_data, seeds_data, field_data, field1_data, gfield_data, gfolder_data):
    
    global data
    
    # -------- Loop through history to ensure all records are captured --------
    for crop_h in history_data['data']:
        entry={
            'crop_id': crop_h['crop_id'],
            'field_id': crop_h['field_id'],
            'harvesting_date': crop_h['harvesting_date'],
            'harvested_weight': crop_h['harvested_weight'],
            'productivity': crop_h.get('productivity'),
            'variety': crop_h.get('variety')
        }
        if bool(entry['harvested_weight']) == True:
            for crop in crops_data['data']:
                if crop_h['crop_id'] == crop['id']:
                    entry.update({
                        'crop_name': crop['name'],
                    })
            for seed in seeds_data['data']:
                if seed['crop_id'] == crop_h['crop_id']:
                    entry.update({
                        'seed_name': seed['name'],
                        'seed_id': seed['id'],
                    })
            data.append(entry)

    # -------- Remove entries without field_id --------
    data = [entry for entry in data if 'field_id' in entry]

    # -------- Enrich data with field and group field information --------
    for entry in data:
        for field in field_data['data']:
            if field['id'] == entry['field_id']:
                entry.update({
                    'field_name': field['name'],
                    'area_hectare': field['tillable_area'],
                    'yield_per_hectar': (entry['productivity']*0.042),
                    'field_group_id': field['field_group_id'],
                    'lat': field['lat'],
                    'long': field['long']
                })
        for field1 in field1_data['data']:
            if field1['id'] == entry['field_id']:
                entry.update({
                    'field_name': field1['name'],
                    'field_group_id': field1['field_group_id'],
                    'lat': field1['lat'],
                    'long': field1['long']
                })

    for entry in data:
        for gfield in gfield_data['data']:
            try:
                if gfield['id'] == entry['field_group_id']:
                    entry.update({
                            'group_field_name': gfield['name'],
                            'group_folder_id': gfield['group_folder_id']
                                })
            except KeyError: 
                continue

        for gfolder in gfolder_data['data']:
            try:
                if gfolder['id'] == entry['group_folder_id']:
                    entry.update({
                        'group_folder_name': gfolder['name']
                    })
            except KeyError:
                continue

    data = [entry for entry in data if entry['group_field_name'] in Oweinat or entry['group_field_name'] in Toshka]
# ---------------- Get all the unique crop varieties ----------------
def get_varieties():
    global data, varieties
    varieties=set()
    for i in range(len(data)):
        try:
            varieties.add(data[i]['seed_name'])
            varieties.add(data[i]['variety'])
        except KeyError:
            continue
    return varieties
# ---------------- split data by crop and save to separate JSON files ----------------
def split_crops(data):
    
    from collections import defaultdict
    crops_data = defaultdict(list)

    # Group by crop
    for item in data:
        crop_name = item.get('crop_name', 'Unknown')
        crops_data[crop_name].append(item)
    eff_count = 0 
    avg_efficiency =  0
    for crop_name, crop_items in crops_data.items():
        # Calculate totals
        eff_count+=1
        total_production = sum(item.get('harvested_weight', 0) for item in crop_items)
        total_area = sum(item.get('area_hectare', 0) for item in crop_items)
        avg_efficiency += item.get('productivity')
    

        # Prepare safe filename
        safe_crop_name = "".join(c for c in crop_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_crop_name = safe_crop_name.replace(' ', '_')
        filename = f"{safe_crop_name}_data.json"

        # Build JSON structure
        crop_output = {
            "crop_name": crop_name,
            "totals": {
                "total_production": total_production,
                "total_area": total_area,
                "avg_efficiency": avg_efficiency
            },
            "records": crop_items
        }
        avg_efficiency = (avg_efficiency * 0.042) / eff_count

        # Save to file
        with open(os.path.join(f'{wdir}\\processed_data\\crops_data',filename), 'w',encoding='utf-8') as file:
            json.dump(crop_output, file, indent=2, ensure_ascii=False)

        print(f"Created {filename}: {len(crop_items)} records")
        print(f"Totals: {total_production} tons, {total_area} ha, Yield={avg_efficiency:.2f} t/ha")

    # Summary
    print(f"\nTotal records: {len(data)}")
    print(f"Unique crops: {len(crops_data)}")
    for crop_name, items in crops_data.items():
        print(f"  {crop_name}: {len(items)} records")
# ---------------- Split data by group folder and save to separate JSON files ----------------
def split_by_group(data, output_prefix="grouped"):
    
    grouped = {
        "East Oweinat Project": [],
        "Toshka project": []
    }

    for item in data:
        folder = item.get("group_folder_name", "")

        if folder == "East Oweinat Project":
            grouped["East Oweinat Project"].append(item)
        elif folder == "Toshka project":
            grouped["Toshka project"].append(item)

    # Save each group into its own JSON file
    for group_name, items in grouped.items():
        filename = f"{output_prefix}_{group_name.replace(' ', '_')}.json"
        with open(os.path.join(f'{wdir}\\processed_data\\grouped',filename), 'w',encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"✅ {group_name}: {len(items)} records → saved to {filename}")

    return grouped
# ---------------- Build project-crop-variety totals and save to JSON files ----------------
def build_project_crop_variety_totals(data, output_prefix="project"):
    from collections import defaultdict
    import os, json

    # Directly group by project → crop → variety
    grouped = {
        "East Oweinat Project": defaultdict(lambda: defaultdict(list)),
        "Toshka project": defaultdict(lambda: defaultdict(list))
    }

    # Step 1: assign items to projects → crops → varieties
    for item in data:
        folder = item.get("group_folder_name", "")
        crop = item.get("crop_name", "Unknown Crop")
        variety = item.get("variety") or item.get("seed_name") or "Unknown Variety"

        # normalize variety name to lowercase for merging
        norm_variety = variety.strip().lower()

        if folder == "East Oweinat Project":
            grouped["East Oweinat Project"][crop][norm_variety].append(item)
        elif folder == "Toshka project":
            grouped["Toshka project"][crop][norm_variety].append(item)

    # Step 2: build outputs with totals
    project_output = {}
    for project_name, crops in grouped.items():
        project_output[project_name] = {}
        for crop_name, varieties in crops.items():
            crop_varieties = []
            for norm_variety, items in varieties.items():
                total_production = sum(i.get("harvested_weight", 0) for i in items)

                # efficiency calculation
                eff_values = [i.get("productivity", 0) * 0.042 for i in items if i.get("productivity", 0) > 0]
                avg_efficiency = sum(eff_values) / len(eff_values) if eff_values else 0

                # Use the first non-empty original variety name for output
                original_name = next(
                    (i.get("variety") or i.get("seed_name") or "Unknown Variety") for i in items
                )

                crop_varieties.append({
                    "variety": original_name,
                    "total_production": total_production,
                    "total_area": total_area,
                    "avg_efficiency": round(avg_efficiency, 2)
                })

            # Only keep crops that have valid varieties
            if crop_varieties:
                project_output[project_name][crop_name] = crop_varieties
                print(project_name, crop_name, len(crop_varieties))

        # Save each project to its own JSON file
        filename = f"{output_prefix}_{project_name.replace(' ', '_')}.json"
        with open(os.path.join(f'{wdir}\\processed_data\\project', filename), 'w', encoding='utf-8') as f:
            json.dump(project_output[project_name], f, indent=2, ensure_ascii=False)

        print(f"✅ {project_name}: {len(project_output[project_name])} crops → saved to {filename}")

    return project_output
# ---------------- Build summary data for projects and save to JSON file ----------------
def project_data(data):
    all_crops=[]
    crops_toshka=[]
    crops_oweinat=[]
    with open(os.path.join(f"{wdir}\\processed_data\\agriculturalData.js"), "r", encoding="utf-8") as f:
        js_content = f.read().strip()

    js_content = js_content.replace("export const agriculturalData =", "",1).strip()
    if js_content.endswith(";"):
        js_content = js_content[:-1]
    agricultural_data = json.loads(js_content)

    for crop in agricultural_data:
        crop_name=crop
        crop_production=agricultural_data[crop]['productionPerTon']
        crop_avg_efficiency=agricultural_data[crop]['avgEfficiency']
        if crop_avg_efficiency is None:
            crop_avg_efficiency=0
        crop_dict={crop_name:{'total_production':crop_production,'avg_efficiency':crop_avg_efficiency}}
        all_crops.append(crop_dict)
    project_toshka=json.loads(open(os.path.join(f'{wdir}\\processed_data\\project','project_Toshka_project.json'), 'r',encoding='utf-8').read())
    project_oweinat=json.loads(open(os.path.join(f'{wdir}\\processed_data\\project','project_East_Oweinat_Project.json'), 'r',encoding='utf-8').read())
    for crop in project_toshka:
        crop_name=crop
        crop_production=0
        crop_total_area=0
        crop_avg_efficiency=0
        for variety in project_toshka[crop]:
            crop_production+=variety['total_production']
            crop_total_area+=variety['total_area']
            crop_avg_efficiency+=variety['avg_efficiency']
        crop_dict={crop_name:{'total_production':crop_production,'total_area':crop_total_area,'avg_efficiency':crop_avg_efficiency}}
        crops_toshka.append(crop_dict)
    for crop in project_oweinat:
        crop_name=crop
        crop_production=0
        crop_total_area=0
        crop_avg_efficiency=0
        for variety in project_oweinat[crop]:
            crop_production+=variety['total_production']
            crop_total_area+=variety['total_area']
            crop_avg_efficiency+=variety['avg_efficiency']
        crop_dict={crop_name:{'total_production':crop_production,'total_area':crop_total_area,'avg_efficiency':crop_avg_efficiency}}
        crops_oweinat.append(crop_dict)
        
    with open(os.path.join(f'{wdir}\\processed_data','crop_lists.json'), 'w',encoding='utf-8') as f:
        json.dump({'All':all_crops,'Toshka':crops_toshka,'Oweinat':crops_oweinat}, f,indent=4)
    return crops_toshka, crops_oweinat
# ---------------- Build agricultural data structure and save to JS file ----------------
def build_agricultural_data(data, output_file="agriculturalData.js"):
    agricultural_data = defaultdict(lambda: {
        "name": None,
        "avgEfficiency": 0,
        "productionPerTon": 0,
        "varieties": []
    })

    totals = defaultdict(lambda: {"production": 0})

    for entry in data:
        crop_name = entry.get("crop_name", "Unknown")
        harvested = entry.get("harvested_weight") or 0
        productivity = entry.get("productivity") or 0

        crop_block = agricultural_data[crop_name]
        crop_block["name"] = crop_name
        totals[crop_name]["production"] += harvested

        crop_block["varieties"].append({
            "name": entry.get("variety") or entry.get("seed_name") or crop_name,
            "location": [entry.get("lat"), entry.get("long")],
            "production": harvested,
            "avg": productivity  # keep raw productivity here
        })

    # Finalize totals per crop
    for crop_name, crop_block in agricultural_data.items():
        total_production = totals[crop_name]["production"]

        # collect productivity values > 0
        productivity_values = [v["avg"] for v in crop_block["varieties"] if v["avg"] > 0]

        if productivity_values:
            avg_efficiency = (sum(productivity_values) * 0.042) / len(productivity_values)
        else:
            avg_efficiency = 0

        crop_block["productionPerTon"] = total_production
        crop_block["avgEfficiency"] = round(avg_efficiency, 2)

    # Save to file
    with open(os.path.join(f"{wdir}\\processed_data", output_file), "w", encoding="utf-8") as f:
        f.write("export const agriculturalData = ")
        json.dump(dict(agricultural_data), f, indent=4, ensure_ascii=False)
        f.write(";")

    print(f"✅ Agricultural data exported to {output_file}")

    return agricultural_data
# ---------------- Create a grouped JSON structure and save to file ----------------
def create_grouped_json(data, output_file="grouped_data.json"):
    grouped = defaultdict(lambda: {
        "current_production": 0,
        "last_year_production": 0,
        "efficiency_sum": 0,     
        "crops": {}
    })

    for item in data:
        group_field = item.get("group_field_name")
        crop_name = item.get("crop_name")

        if not group_field or not crop_name:
            continue  # skip invalid data

        crop_eff = item.get("productivity")
        crop_prod = item.get("harvested_weight", 0)

        # update group totals
        grouped[group_field]["current_production"] += item.get("harvested_weight", 0)
        #grouped[group_field]["last_year_production"] += item.get("last_year_production", 0)

        # only count efficiency if crop has yield > 0
        if crop_eff and crop_eff > 0 and crop_prod > 0:
            grouped[group_field]["efficiency_sum"] += crop_eff
            
        # add crop details
        grouped[group_field]["crops"][crop_name] = {
            "production": crop_prod,
            "avg_efficiency": crop_eff if crop_eff else 0
        }

    # finalize structure
    result = {}
    for group, vals in grouped.items():
        avg_eff = (
            vals["efficiency_sum"] * 0.042
        )
        result[group] = {
            "avg_efficiency": round(avg_eff, 2),
            "current_production": vals["current_production"],
            "last_year_production": vals["last_year_production"],
            "crops": vals["crops"]
        }

    # save JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4, ensure_ascii=False)

    return result
# ---------------- Build project summary and save to JSON file ----------------
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
    all_avg_eff = sum(effs) * 0.042 / len(effs)
    result["All"] = {
        "production": all_production,
        "avg_efficiency": all_avg_eff,
        "group_fields": {}
    }
    
    with open(os.path.join(f"{wdir}\\processed_data","projects_summary.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)

    return result
# ---------------- Build monthly JSON structure and save to file ----------------
def build_monthly_json(data, output_file="monthly_data.json"):
    """
    Builds JSON grouped by project -> group_field -> crop -> month
    Includes avg_efficiency only for crops with productivity > 0
    Adds yield = total_production / total_area
    """

    # nested defaultdicts
    result = defaultdict(
        lambda: defaultdict(
            lambda: defaultdict(
                lambda: defaultdict(lambda: {"production": 0, "area": 0, "eff_sum": 0,"count": 0})
            )
        )
    )

    for item in data:
        project = item["group_folder_name"]       # e.g. Toshka project
        group = item["group_field_name"]          # e.g. Pump station 1
        crop = item["crop_name"]     
        date_obj = safe_parse_date(item.get("harvesting_date"))
        month = date_obj.strftime("%b") if date_obj else print(item.get('field_id'))
        production = item.get("harvested_weight", 0) or 0
        area = item.get("area_hectare", 0) or 0
        efficiency = item.get("productivity", 0) or 0

        # crop level
        result[project][group][crop][month]["production"] += production
        result[project][group][crop][month]["area"] += area
        if efficiency > 0 and production > 0:
            result[project][group][crop][month]["eff_sum"] += efficiency
            result[project][group][crop][month]["count"] += 1
           
        # group-level "All"
        result[project][group]["All"][month]["production"] += production
        result[project][group]["All"][month]["area"] += area
        if efficiency > 0 and production > 0:
            result[project][group]["All"][month]["eff_sum"] += efficiency
            result[project][group]["All"][month]["count"] += 1

    # finalize averages and yield
    final_result = {}
    for project, groups in result.items():
        final_result[project] = {}
        for group, crops in groups.items():
            final_result[project][group] = {}
            for crop, months in crops.items():
                final_result[project][group][crop] = {}
                for month, values in months.items():
                    avg_eff = (values["eff_sum"] * 0.042)/values['count']
                    final_result[project][group][crop][month] = {
                        "production": round(values["production"], 2),
                        "avg_efficiency": round(avg_eff, 2),
                    }

    # save JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(final_result, f, indent=4, ensure_ascii=False)

    return final_result
# ---------------- Save the new data structure to a JSON file ----------------
def save_data():
    global data
    with open(os.path.join(f'{wdir}\\processed_data','data.json'), 'w',encoding='utf-8') as f:
        json.dump(data, f,indent=4)
# ---------------- Print lengths of all loaded datasets ----------------
def print_data_lengths():
    
    global history_data, crops_data, seeds_data, field_data, field1_data, gfield_data, gfolder_data
    
    print(f'\nhistory.json lentgh: {len(history_data['data'])} records')

    print(f'\nfield.json lengh: {len(field_data['data'])} records')

    print(f'\nfield1.json lengh: {len(field1_data['data'])} records')

    print(f'\ngfield.json lengh: {len(gfield_data['data'])}records')

    print(f'\ngfolder.json lengh: {len(gfolder_data['data'])} records')

    print(f'\nseed.json lentgh: {len(seeds_data['data'])} records')

    print(f'\ncrop.json lentgh: {len(crops_data['data'])} records')

    print(f'\nvariety lenght: {len(get_varieties())}\nvarieties: {get_varieties()}\n')
# ---------------- Execute the functions to get data and process it ----------------
get_crops_data()
get_fields_data()
load_fields_data()
gather_crop_data(history_data, crops_data, seeds_data, field_data, field1_data, gfield_data, gfolder_data)
save_data()
print_data_lengths()
split_crops(data)
split_by_group(data)
build_project_crop_variety_totals(data)
build_agricultural_data(data)
project_data(data)
create_grouped_json(data, output_file=os.path.join(f'{wdir}\\processed_data','grouped_data.json'))
build_project_summary(data)
build_monthly_json(data, output_file=os.path.join(f'{wdir}\\processed_data','monthly_crops.json'))