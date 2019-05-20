from flask import Flask, jsonify
import pymongo
from mongo_to_geojson import mongo_to_geojson 
#################################################
# Database Setup
#################################################


# app = Flask(__name__)

mongo_uri = 'mongodb://localhost/27017'
client = pymongo.MongoClient(mongo_uri)
db = client.election 
collection = 'test2'
output_geojson =  'test2.json'
# query = {"POP": {"$gte": 100000}}

# @app.route("/2016")
# def election2016():
try:  
    mongo_to_geojson(mongo_uri,collection,output_geojson)  
except:  
    print('mongo_to_geojson no worky')

#################################################
# GEOJSON
#################################################

# if __name__ == '__main__':
#     app.run(debug=True)