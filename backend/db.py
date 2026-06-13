import sqlite3
import os
import pandas as pd

DB_FILE = 'erp.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Pastors Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS pastors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            ordination_date TEXT,
            contact TEXT
        )
    ''')
    
    # Churches Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS churches (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            region TEXT,
            section TEXT,
            deed_details TEXT
        )
    ''')
    
    # Assignments Table (Pastor to Church mapping over time)
    c.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pastor_id TEXT,
            church_id TEXT,
            start_date TEXT,
            end_date TEXT,
            transfer_reason TEXT,
            complaints TEXT,
            FOREIGN KEY(pastor_id) REFERENCES pastors(id),
            FOREIGN KEY(church_id) REFERENCES churches(id)
        )
    ''')
    
    # Metrics Table (Attendance, Baptisms, etc. at a specific church at a specific date)
    c.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            church_id TEXT,
            date TEXT,
            attendance INTEGER,
            baptisms INTEGER,
            membership_count INTEGER,
            FOREIGN KEY(church_id) REFERENCES churches(id)
        )
    ''')
    
    conn.commit()
    conn.close()

if not os.path.exists(DB_FILE):
    init_db()
