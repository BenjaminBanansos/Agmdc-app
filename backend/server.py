from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import json
import os
import pandas as pd
import db as bi_db

app = Flask(__name__)
CORS(app)

DB_FILE = 'db.json'

def load_db():
    if not os.path.exists(DB_FILE):
        return {"inbox": [], "candidates": [], "pipeline": [], "hierarchy": []}
    try:
        with open(DB_FILE, 'r') as f:
            db = json.load(f)
            if "inbox" not in db: db["inbox"] = []
            if "candidates" not in db: db["candidates"] = []
            if "pipeline" not in db: db["pipeline"] = []
            if "hierarchy" not in db: db["hierarchy"] = []
            return db
    except:
        return {"inbox": [], "candidates": [], "pipeline": [], "hierarchy": []}

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/inbox', methods=['GET'])
def get_inbox():
    db = load_db()
    return jsonify(db.get("inbox", []))

@app.route('/allocate', methods=['POST'])
def allocate_resource():
    data = request.json
    dept_key = data.get('deptKey')
    resource = data.get('resource')
    
    if not dept_key or not resource:
        return jsonify({"status": "error", "message": "Missing data"}), 400
        
    db = load_db()
    
    if dept_key not in db:
        db[dept_key] = []
        
    db[dept_key].append(resource)
    save_db(db)
    
    return jsonify({"status": "success", "message": "Resource saved to backend database."})

@app.route('/resources/<dept_key>', methods=['GET'])
def get_resources(dept_key):
    db = load_db()
    resources = db.get(dept_key, [])
    return jsonify(resources)

# --- Administration Endpoints ---

@app.route('/admin/candidates', methods=['GET'])
def get_candidates():
    db = load_db()
    return jsonify(db.get("candidates", []))

@app.route('/admin/candidates', methods=['POST'])
def add_candidate():
    db = load_db()
    data = request.json
    candidate = {
        "id": f"cand_{int(time.time()*1000)}",
        "name": data.get("name"),
        "role": data.get("role"),
        "status": data.get("status"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    }
    db["candidates"].append(candidate)
    save_db(db)
    return jsonify({"status": "success", "candidate": candidate})

@app.route('/admin/pipeline', methods=['GET'])
def get_pipeline():
    db = load_db()
    return jsonify(db.get("pipeline", []))

@app.route('/admin/pipeline', methods=['POST'])
def add_pipeline():
    db = load_db()
    data = request.json
    project = {
        "id": f"proj_{int(time.time()*1000)}",
        "name": data.get("name"),
        "type": data.get("type"),
        "status": data.get("status"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    }
    db["pipeline"].append(project)
    save_db(db)
    return jsonify({"status": "success", "project": project})

@app.route('/admin/hierarchy', methods=['GET'])
def get_hierarchy():
    db = load_db()
    return jsonify(db.get("hierarchy", []))

@app.route('/admin/hierarchy', methods=['POST'])
def save_hierarchy():
    db = load_db()
    data = request.json
    db["hierarchy"] = data
    save_db(db)
    return jsonify({"status": "success", "hierarchy": db["hierarchy"]})

# --- BI Dashboard & Forms Endpoints ---

@app.route('/forms/upload', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    table_name = request.form.get('table') # e.g., 'pastors', 'churches', 'assignments', 'metrics'
    if not table_name:
        return jsonify({"status": "error", "message": "Table name required"}), 400
        
    try:
        df = pd.read_excel(file)
        # Validation: check for NaN
        df = df.fillna('')
        
        conn = bi_db.get_db_connection()
        # Insert into SQLite
        df.to_sql(table_name, conn, if_exists='append', index=False)
        conn.close()
        
        return jsonify({"status": "success", "message": f"Successfully imported {len(df)} records into {table_name}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/forms/submit-single', methods=['POST'])
def submit_single():
    data = request.json
    table_name = data.get('table')
    record = data.get('record')
    
    if not table_name or not record:
        return jsonify({"status": "error", "message": "Table and record data required"}), 400
        
    try:
        conn = bi_db.get_db_connection()
        df = pd.DataFrame([record])
        df.to_sql(table_name, conn, if_exists='append', index=False)
        conn.close()
        return jsonify({"status": "success", "message": f"Successfully added record to {table_name}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/forms/analytics/pastor/<pastor_id>', methods=['GET'])
def get_pastor_analytics(pastor_id):
    conn = bi_db.get_db_connection()
    
    try:
        # Load tables into DataFrames
        assignments_df = pd.read_sql_query(f"SELECT * FROM assignments WHERE pastor_id = '{pastor_id}'", conn)
        if assignments_df.empty:
            return jsonify({"status": "success", "data": {"metrics": [], "summary": {}}})
            
        metrics_df = pd.read_sql_query("SELECT * FROM metrics", conn)
        
        # We need to filter metrics where the metric date falls between the assignment start and end date for that church
        # For simplicity, if we just want all metrics for churches the pastor was assigned to:
        church_ids = assignments_df['church_id'].tolist()
        
        if not church_ids:
             return jsonify({"status": "success", "data": {"metrics": [], "summary": {}}})
             
        church_ids_str = "','".join(church_ids)
        filtered_metrics_df = pd.read_sql_query(f"SELECT * FROM metrics WHERE church_id IN ('{church_ids_str}')", conn)
        
        # Summary
        summary = {
            "total_baptisms": int(filtered_metrics_df['baptisms'].sum()) if not filtered_metrics_df.empty else 0,
            "average_attendance": float(filtered_metrics_df['attendance'].mean()) if not filtered_metrics_df.empty else 0,
            "total_churches": len(set(church_ids))
        }
        
        conn.close()
        return jsonify({
            "status": "success", 
            "data": {
                "assignments": assignments_df.to_dict(orient='records'),
                "metrics": filtered_metrics_df.to_dict(orient='records'),
                "summary": summary
            }
        })
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/forms/data/<table>', methods=['GET'])
def get_table_data(table):
    try:
        conn = bi_db.get_db_connection()
        df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
        conn.close()
        return jsonify({"status": "success", "data": df.to_dict(orient='records')})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("AGMDC Python Backend Running on Port 5001...")
    app.run(port=5001, debug=True)
