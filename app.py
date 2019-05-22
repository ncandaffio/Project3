from flask import Flask, jsonify
import pymongo
import json
from bson import ObjectId

#################################################
# Database Setup
#################################################


app = Flask(__name__)

conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)
db = client.electionDB 
# collection = db['2008']

#################################################
# Flask Routes
#################################################

#################################################
# API ROUTES
#################################################

@app.route("/")
def Home():
    """List all available api routes."""
    return (
        f"API for project"
        
    )
#################################################
# API PRECIPITATION
#################################################

@app.route("/<year>")
def data(year):
    """Display all data from the collection.""" 
    # session_ls = list(db[year].find({'_id':False}))
    a = []
    for result in db[year].find(): 
        aa = {
            'type': result['type'],
            'properties': result['properties'],
            'geometry': result['geometry'] 
        }
        
        a.append(aa)
    return jsonify(a)


if __name__ == '__main__':
    app.run(debug=True)