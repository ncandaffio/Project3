import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///elections.db")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
District = Base.classes.data

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    return (
        f"District_Data:<br/>"
    )


@app.route("/api/<year>")
def main(year):

    results = session.query(District.District, District[year], District.GeoData).all()

    geojson = []
    for result in results:
        geojsonFeature = {
        "type": "Feature",
        "properties": {
            "District": result.District,
            "Year": year,
            "Results": result[year]},
        "Geometry": result.GeoData
        }
        geojson.append(geojsonFeature)

    return geojson

if __name__ == '__main__':
    app.run(debug=True)
