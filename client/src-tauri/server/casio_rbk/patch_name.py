import os.path
import csv

def patch_name(patch_no, bank_msb):
  
  patch_data_dir = os.path.join(os.path.dirname(__file__), "patch_data")
  
  with open(os.path.join(patch_data_dir, "CT-X5000 tone.csv"), "r") as f1:
    csvread = csv.reader(f1)
    
    for row in csvread:
      if bank_msb==int(row[0]) and patch_no==int(row[1]):
        return row[2][4:]  # Remove first 4 characters -- 3-digit number plus a space
        
  return "Unknown"
