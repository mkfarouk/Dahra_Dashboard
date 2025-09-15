import requests
import json
import os
from collections import defaultdict

Oweinat=['Unit 3','Unit 13']
Toshka=['Date palm','Pump station 1','Pump station 2','Pump station 3','Pump station 4','Pump station 5','Pump station 6','Pump station 7','Pump station 8','Pump station 9']

url_history = "https://operations.cropwise.com/api/v3/history_items?year=2025"
url_fields = "https://operations.cropwise.com/api/v3/fields"
url_fields1= "https://operations.cropwise.com/api/v3a/fields"
url_groupfield="https://operations.cropwise.com/api/v3/field_groups"
url_gfolder='https://operations.cropwise.com/api/v3/group_folders'
url_seeds="https://operations.cropwise.com/api/v3/seeds"
url_crops="https://operations.cropwise.com/api/v3/crops"

token_headers = {'user_api_token': '5SZLxNBxQGCs-xmH7uaH'}

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
    with open('history.json', 'w') as f:
        json.dump(history_data, f,indent=4)

    seeds_r = requests.get(url_seeds,token_headers)
    seeds_data=seeds_r.json()
    with open('seeds.json', 'w') as f:
        json.dump(seeds_data, f,indent=4)   

    crops_r = requests.get(url_crops,token_headers)
    crops_data=crops_r.json()   
    with open('crops.json', 'w') as f:
        json.dump(crops_data, f,indent=4)
# ---------------- Get field related data from the API and save to JSON files ----------------
def get_fields_data():
    
    global field_data, field1_data, gfield_data, gfolder_data
    
    field_r = requests.get(url_fields,token_headers)
    field_data=field_r.json()
    with open('fields.json', 'w') as f:
        json.dump(field_data, f,indent=4)
    
    field1_r = requests.get(url_fields1,token_headers)
    field1_data=field1_r.json()
    with open('fields1.json', 'w') as f:
        json.dump(field1_data, f,indent=4)
    
    gfield_r = requests.get(url_groupfield,token_headers)
    gfield_data=gfield_r.json()
    with open('gfields.json', 'w') as f:
        json.dump(gfield_data, f,indent=4)
  
    gfolder_r = requests.get(url_gfolder,token_headers)
    gfolder_data=gfolder_r.json()
    with open('gfolders.json', 'w') as f:
        json.dump(gfolder_data, f,indent=4)
# ---------------- Load data from JSON files ----------------
def load_fields_data():
    
    global field_data, field1_data, gfield_data, gfolder_data
    
    with open('fields.json', 'r') as f:
        field_data = json.load(f)

    with open('fields1.json', 'r') as f:
        field1_data = json.load(f)

    with open('gfields.json', 'r') as f:
        gfield_data = json.load(f)
    
    with open('gfolders.json', 'r') as f:
        gfolder_data = json.load(f)
    
    return field_data, field1_data, gfield_data, gfolder_data
# ---------------- Create a new data structure by merging relevant information ----------------
def gather_crop_data():
    
    global data, history_data, crops_data, seeds_data, field_data, field1_data, gfield_data, gfolder_data
    
    # -------- Loop through history to ensure all records are captured --------
    for crop_h in history_data['data']:
        entry={
            'crop_id': crop_h['crop_id'],
            'field_id': crop_h['field_id'],
            'harvesting_date': crop_h['harvesting_date'],
            'harvested_weight': crop_h['harvested_weight'],
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
                    'yield_per_fed': (entry['harvested_weight']/field['tillable_area']) if (field['tillable_area'] and entry['harvested_weight']) else None,
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
# ---------------- Save the new data structure to a JSON file ----------------
def save_data():
    global data
    with open('data.json', 'w') as f:
        json.dump(data, f,indent=4)
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
def split_crops():
    global data, crops_data
    from collections import defaultdict
    crops_data = defaultdict(list)

    # Group by crop
    for item in data:
        crop_name = item.get('crop_name', 'Unknown')
        crops_data[crop_name].append(item)

    for crop_name, crop_items in crops_data.items():
        # Calculate totals
        total_production = sum(item.get('harvested_weight', 0) for item in crop_items)
        total_area = sum(item.get('area_hectare', 0) for item in crop_items)
        avg_efficiency = total_production / total_area if total_area else 0

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

        # Save to file
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(crop_output, file, indent=2, ensure_ascii=False)

        print(f"Created {filename}: {len(crop_items)} records")
        print(f"  → Totals: {total_production} tons, {total_area} ha, Yield={avg_efficiency:.2f} t/ha")

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
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"✅ {group_name}: {len(items)} records → saved to {filename}")

    return grouped
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
gather_crop_data()
save_data()
print_data_lengths()
split_crops()
split_by_group(data)