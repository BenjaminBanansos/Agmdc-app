import pandas as pd
import os

def create_dummy_files():
    print("Generating dummy Excel files for testing...")

    # 1. Pastors
    pastors = [
        {"id": "P-003", "name": "Rev. Samuel Johnson", "ordination_date": "2008-03-10", "contact": "samuel@example.com"},
        {"id": "P-004", "name": "Rev. David Varghese", "ordination_date": "2012-11-22", "contact": "david@example.com"}
    ]
    pd.DataFrame(pastors).to_excel("dummy_pastors.xlsx", index=False)
    print("Created dummy_pastors.xlsx")

    # 2. Churches
    churches = [
        {"id": "CH-003", "name": "AG Church Kollam", "region": "South", "section": "Kollam", "deed_details": "Owned"},
        {"id": "CH-004", "name": "AG Church Alappuzha", "region": "South", "section": "Alappuzha", "deed_details": "Rented"}
    ]
    pd.DataFrame(churches).to_excel("dummy_churches.xlsx", index=False)
    print("Created dummy_churches.xlsx")

    # 3. Assignments
    assignments = [
        {"pastor_id": "P-003", "church_id": "CH-003", "start_date": "2019-01-01", "end_date": "2022-12-31", "transfer_reason": "Routine", "complaints": "None"},
        {"pastor_id": "P-003", "church_id": "CH-004", "start_date": "2023-01-01", "end_date": "2026-12-31", "transfer_reason": "", "complaints": "None"},
        {"pastor_id": "P-004", "church_id": "CH-004", "start_date": "2018-01-01", "end_date": "2022-12-31", "transfer_reason": "Requested", "complaints": "None"}
    ]
    pd.DataFrame(assignments).to_excel("dummy_assignments.xlsx", index=False)
    print("Created dummy_assignments.xlsx")

    # 4. Metrics
    metrics = [
        {"church_id": "CH-003", "date": "2019-06-01", "attendance": 120, "baptisms": 3, "membership_count": 80},
        {"church_id": "CH-003", "date": "2020-06-01", "attendance": 140, "baptisms": 5, "membership_count": 90},
        {"church_id": "CH-003", "date": "2021-06-01", "attendance": 160, "baptisms": 8, "membership_count": 105},
        {"church_id": "CH-004", "date": "2023-06-01", "attendance": 85, "baptisms": 2, "membership_count": 60},
        {"church_id": "CH-004", "date": "2024-06-01", "attendance": 100, "baptisms": 4, "membership_count": 70}
    ]
    pd.DataFrame(metrics).to_excel("dummy_metrics.xlsx", index=False)
    print("Created dummy_metrics.xlsx")
    
    print("All dummy files successfully generated in this directory.")

if __name__ == "__main__":
    create_dummy_files()
