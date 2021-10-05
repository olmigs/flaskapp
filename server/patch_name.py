import os.path
import csv
from pathlib import Path

def patch_name(patch_no, bank_msb):
  
  # patch_data_dir = os.path.join(os.path.dirname(__file__), "patch_data")
  
  DATA_FOLDER = Path.cwd() / "patch_data"
  with open(os.path.join(DATA_FOLDER, "CT-X5000 tone.csv"), "r", encoding="utf-8") as f1:
    csvread = csv.reader(f1)
    
    for row in csvread:
      if bank_msb==int(row[0]) and patch_no==int(row[1]):
        return row[2][4:]  # Remove first 4 characters -- 3-digit number plus a space
        
  return "Unknown"
