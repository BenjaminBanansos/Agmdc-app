import sqlite3
import pandas as pd
import db

def populate():
    print("Populating dummy data into erp.db...")
    conn = db.get_db_connection()
    
    # 1. Pastors
    pastors = [
        {"id": "P-001", "name": "Rev. Thomas Mathew", "ordination_date": "2010-05-15", "contact": "thomas@example.com"},
        {"id": "P-002", "name": "Rev. John Doe", "ordination_date": "2015-08-20", "contact": "john@example.com"}
    ]
    pd.DataFrame(pastors).to_sql('pastors', conn, if_exists='replace', index=False)
    
    # 2. Churches
    churches = [
        {"id": "CH-001", "name": "AG Church Trivandrum", "region": "South", "section": "Trivandrum", "deed_details": "Owned"},
        {"id": "CH-002", "name": "AG Church Kochi", "region": "Central", "section": "Ernakulam", "deed_details": "Rented"}
    ]
    pd.DataFrame(churches).to_sql('churches', conn, if_exists='replace', index=False)
    
    # 3. Assignments
    assignments = [
        {"pastor_id": "P-001", "church_id": "CH-001", "start_date": "2020-01-01", "end_date": "2023-12-31", "transfer_reason": "Routine", "complaints": "None"},
        {"pastor_id": "P-001", "church_id": "CH-002", "start_date": "2024-01-01", "end_date": "2026-12-31", "transfer_reason": "", "complaints": "None"},
        {"pastor_id": "P-002", "church_id": "CH-002", "start_date": "2020-01-01", "end_date": "2023-12-31", "transfer_reason": "Routine", "complaints": "None"}
    ]
    pd.DataFrame(assignments).to_sql('assignments', conn, if_exists='replace', index=False)
    
    # 4. Metrics
    metrics = [
        {"church_id": "CH-001", "date": "2021-01-01", "attendance": 150, "baptisms": 5, "membership_count": 100},
        {"church_id": "CH-001", "date": "2022-01-01", "attendance": 180, "baptisms": 10, "membership_count": 120},
        {"church_id": "CH-001", "date": "2023-01-01", "attendance": 200, "baptisms": 15, "membership_count": 140},
        {"church_id": "CH-002", "date": "2021-01-01", "attendance": 80, "baptisms": 2, "membership_count": 50},
        {"church_id": "CH-002", "date": "2022-01-01", "attendance": 90, "baptisms": 4, "membership_count": 60},
        {"church_id": "CH-002", "date": "2024-01-01", "attendance": 110, "baptisms": 3, "membership_count": 70},
        {"church_id": "CH-002", "date": "2025-01-01", "attendance": 130, "baptisms": 6, "membership_count": 80}
    ]
    pd.DataFrame(metrics).to_sql('metrics', conn, if_exists='replace', index=False)
    
    conn.close()
    print("Done!")

if __name__ == "__main__":
    populate()
