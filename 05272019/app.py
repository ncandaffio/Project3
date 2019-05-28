from flask import Flask, jsonify
import pymongo
import json
from bson import ObjectId
from flask_cors import CORS, cross_origin

#################################################
# Database Setup
#################################################


app = Flask(__name__)

conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)
db = client.electioncongress

#################################################
# Flask Routes
#################################################

#################################################
# API ROUTES
#################################################

CORS(app, support_credentials=True)

@app.route("/")
def Home():
    """List all available api routes."""
    return (
        f"API for project<br/><br/>"
        "Available Years<br/><br/>"
        "2008 / 2012 / 2016"
        
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
    return jsonify({"Feature":a})


if __name__ == '__main__':
    app.run(debug=True)