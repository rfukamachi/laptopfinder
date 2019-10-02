import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


# Database Setup

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('DATABASE_URL', '')
# "postgres://thwylvrffekvda:405fd770884eaf24a61072f0261d515cb8ae5d956cea328e7df49b65a5ca5377@ec2-107-22-228-141.compute-1.amazonaws.com:5432/d3pm17n787nc2k"
#or "postgres://postgres:helloworld@localhost:5432/laptop_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# os.environ.get('DATABASE_URL', '')

db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
laptops = Base.classes.both_laptops
locations_bb = Base.classes.bestbuy_locations
locations_frys = Base.classes.frys_locations


session = Session(db.engine)


@app.route("/homepage/index.html")
def index():
    # returns the homepage index.html
    return render_template("index.html")


##################################################
# Data Table Page:
##################################################
@app.route("/homepage/data.html")
def data():

    sel_lapatops = [
        laptops.store,
        laptops.price,
        laptops.brand,
        laptops.model,
        laptops.cpu,
        laptops.hd,
        laptops.ram,
        laptops.screensize,
        # laptops.title,
        laptops.upc,
        laptops.link
    ]

    results = db.session.query(*sel_lapatops).all()

    laptopList = []
    for x in results:
        laptopObject = {}
        laptopObject["store"] = x[0]
        laptopObject["price"] = x[1]
        laptopObject["brand"] = x[2]
        laptopObject["model"] = x[3]
        laptopObject["cpu"] = x[4]
        laptopObject["hd"] = x[5]
        laptopObject["ram"] = x[6]
        laptopObject["screensize"] = x[7]
        # laptopObject["title"] = x[8]
        laptopObject["upc"] = x[8]
        laptopObject["link"] = x[9]

        laptopList.append(laptopObject)

    return render_template("data.html", data=laptopList)

##################################################
# For the data.js to pull data:
##################################################
@app.route("/api/data")
def data_api():

    sel_lapatops = [
        laptops.store,
        laptops.price,
        laptops.brand,
        laptops.model,
        laptops.cpu,
        laptops.hd,
        laptops.ram,
        laptops.screensize,
        # laptops.title,
        laptops.upc,
        laptops.link
    ]

    results = db.session.query(*sel_lapatops).all()

    laptopList = []

    for x in results:
        laptopObject = {}
        laptopObject["store"] = x[0]
        laptopObject["price"] = x[1]
        laptopObject["brand"] = x[2]
        laptopObject["model"] = x[3]
        laptopObject["cpu"] = x[4]
        laptopObject["hd"] = x[5]
        laptopObject["ram"] = x[6]
        laptopObject["screensize"] = x[7]
        # laptopObject["title"] = x[8]
        laptopObject["upc"] = x[8]
        laptopObject["link"] = x[9]

        laptopList.append(laptopObject)

    return jsonify(laptopList)


@app.route("/homepage/chart.html")
def chart():
    stmt_laptops2 = db.session.query(laptops).statement
    df_laptops2 = pd.read_sql_query(stmt_laptops2, db.session.bind)
    data_laptops2 = df_laptops2.to_json()
    # print(data_laptops2)
#     # return jsonify(list(df_map.columns)[2:])
#     # placeholder text till the map is finished
    return render_template("chart.html", data=data_laptops2)
#     # placeholder text till the table is finished


@app.route("/homepage/map.html")
def map():
    sel_bb = [
        locations_bb.lat,
        locations_bb.lng,
        locations_bb.store,
        locations_bb.address
    ]

    stmt_map_bb = db.session.query(*sel_bb).all()

    sel_frys = [
        locations_frys.lat,
        locations_frys.lng,
        locations_frys.store,
        locations_frys.address
    ]

    stmt_map_frys = db.session.query(*sel_frys).all()

    bblist = []
    for x in stmt_map_bb:
        bbcoords = {}
        bbcoords['lat'] = x[0]
        bbcoords['lng'] = x[1]
        bbcoords['store'] = x[2]
        bbcoords['address'] = x[3]

        bblist.append(bbcoords)

    fryslist = []
    for x in stmt_map_frys:
        fryscoords = {}
        fryscoords['lat'] = x[0]
        fryscoords['lng'] = x[1]
        fryscoords['store'] = x[2]
        fryscoords['address'] = x[3]

        fryslist.append(fryscoords)

    return render_template("map.html", bestbuy=bblist, frys=fryslist)


if __name__ == "__main__":
    app.run(debug=True)
