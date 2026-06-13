import pandas as pd
import random
from datetime import datetime, timedelta
import os

def generate_large_data():
    print("Generating large dataset (this might take a moment)...")

    num_pastors = 1500
    num_churches = 300

    # 1. Generate Pastors
    pastors = []
    first_names = ["John", "David", "Thomas", "Samuel", "Peter", "Matthew", "James", "Philip", "Simon", "Andrew", "Babu", "Varghese", "Kurian", "Oommen", "George", "Joseph", "Abraham", "Isaac", "Jacob", "Paul"]
    last_names = ["Mathew", "Varghese", "John", "Joseph", "George", "Abraham", "Oommen", "Kurian", "Thomas", "Paul", "Philip", "Cherian", "Chacko", "Eapen"]
    
    for i in range(1, num_pastors + 1):
        name = f"Rev. {random.choice(first_names)} {random.choice(last_names)}"
        ord_year = random.randint(1980, 2020)
        ord_date = f"{ord_year}-05-{random.randint(10, 28)}"
        pastors.append({
            "id": f"P-{i:04d}",
            "name": name,
            "ordination_date": ord_date,
            "contact": f"pastor{i}@example.com"
        })
    
    pd.DataFrame(pastors).to_excel("large_pastors.xlsx", index=False)
    print(f"Generated {num_pastors} pastors.")

    # 2. Generate Churches
    churches = []
    regions = ["South", "Central", "North"]
    sections = ["Trivandrum", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"]
    
    for i in range(1, num_churches + 1):
        churches.append({
            "id": f"CH-{i:04d}",
            "name": f"AG Church {random.choice(sections)} {i}",
            "region": random.choice(regions),
            "section": random.choice(sections),
            "deed_details": random.choice(["Owned", "Rented", "Leased"])
        })
    
    pd.DataFrame(churches).to_excel("large_churches.xlsx", index=False)
    print(f"Generated {num_churches} churches.")

    # 3. Generate Assignments
    assignments = []
    # Each pastor gets 1 to 4 assignments over time
    for pastor in pastors:
        num_assignments = random.randint(1, 4)
        current_year = int(pastor["ordination_date"].split("-")[0])
        
        for a in range(num_assignments):
            duration = random.randint(2, 6)
            start_date = f"{current_year}-01-01"
            end_date = f"{current_year + duration}-12-31" if current_year + duration < 2026 else "2026-12-31"
            
            assignments.append({
                "pastor_id": pastor["id"],
                "church_id": f"CH-{random.randint(1, num_churches):04d}",
                "start_date": start_date,
                "end_date": end_date,
                "transfer_reason": random.choice(["Routine", "Requested", "Administrative", ""]),
                "complaints": random.choice(["None", "None", "None", "Minor dispute", "None"])
            })
            current_year += duration + 1
            if current_year >= 2026:
                break
                
    pd.DataFrame(assignments).to_excel("large_assignments.xlsx", index=False)
    print(f"Generated {len(assignments)} assignments.")

    # 4. Generate Metrics (Yearly data for each church from 2015 to 2025)
    metrics = []
    for church in churches:
        base_attendance = random.randint(30, 500)
        for year in range(2015, 2026):
            # Fluctuate attendance by -10% to +15% each year
            base_attendance = int(base_attendance * random.uniform(0.9, 1.15))
            baptisms = int(base_attendance * random.uniform(0.01, 0.08))
            membership = int(base_attendance * 0.7)
            
            metrics.append({
                "church_id": church["id"],
                "date": f"{year}-06-01",
                "attendance": base_attendance,
                "baptisms": baptisms,
                "membership_count": membership
            })
            
    pd.DataFrame(metrics).to_excel("large_metrics.xlsx", index=False)
    print(f"Generated {len(metrics)} metrics records.")

    print("Successfully generated all large dataset files!")

if __name__ == "__main__":
    generate_large_data()
