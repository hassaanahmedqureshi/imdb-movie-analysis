from flask import Flask, jsonify, render_template, request
import pandas as pd
import numpy as np
import json as json
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from scipy.spatial.distance import pdist, squareform
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


app = Flask(__name__)

# Reading data
data_df = pd.read_csv("static/data/movies.csv")
data_df['country'] = data_df['country'].replace(
    'United States', 'United States of America')


@app.route('/')
def index():
    return render_template('index.html')


# Prepare ratings & genres and send it to front-end control panel
@app.route('/ratings')
def get_ratings():
    ratings = data_df['rating'].fillna(
        method='ffill').drop_duplicates().tolist()
    return jsonify(ratings=ratings)


@app.route('/genres')
def get_genres():
    genres = data_df['genre'].fillna(method='ffill').drop_duplicates().tolist()
    return jsonify(genres=genres)


@app.route('/movie-filters', methods=['POST'])
def json_data():
    data = request.get_json()
    ratings_to_filter = data['ratings']
    genres_to_filter = data['genres']
    start_year = int(data['startYear'])
    end_year = int(data['endYear'])

    if not ratings_to_filter:
        ratings_to_filter = data_df['rating']

    if not genres_to_filter:
        genres_to_filter = data_df['genre']

    if not start_year:
        start_year = 1980

    if not end_year:
        end_year = 2020

    filtered_df = data_df[data_df['rating'].isin(ratings_to_filter)]
    filtered_df = filtered_df[filtered_df['genre'].isin(genres_to_filter)]

    filtered_df = filtered_df[filtered_df['year'].between(
        start_year, end_year, inclusive=True)]

    if not data['compareAverage']:
        filtered_df = json.dumps(filtered_df.fillna(
            method='ffill').drop_duplicates().to_dict(orient='records'))

        return jsonify(filtered_df)

    else:
        firstComparison = data['firstComparison']
        secondComparison = data['secondComparison']

        filtered_df = filtered_df.groupby(secondComparison, as_index=False)[
            firstComparison].mean()
        filtered_df = filtered_df.fillna(method='ffill').drop_duplicates()
        filtered_df = json.dumps(filtered_df.to_dict(orient='records'))

        return jsonify(filtered_df)


@app.route("/processdata", methods=['POST'])
def processData():
    raw_data = json.loads(json.dumps(request.get_json()))
    raw_df = pd.DataFrame.from_dict(raw_data)

    # # Load the movie data from a CSV file
    selected_df = raw_df[['budget', 'runtime', 'gross']].fillna(
        method='ffill').astype(int)

    # Standardize the data
    scaler = StandardScaler()
    scaled_df = scaler.fit_transform(selected_df)

    # Perform PCA with 2 components
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(scaled_df)

    # Create a new dataframe with the principal components and the movie titles
    processed_df = pd.DataFrame(
        data=principal_components, columns=['PC1', 'PC2'])

    df1 = raw_df['genre'].to_frame()
    country = raw_df['country'].to_frame()
    budget = raw_df['budget'].to_frame()
    gross = raw_df['gross'].to_frame()
    df2 = processed_df

    pca_data = pd.concat([df1, country, budget, gross, df2], axis=1)

    return jsonify(json.dumps(pca_data.to_dict(orient='records')))


@app.route("/api/country/<country_name>")
def get_country_coordinates(country_name):
    # Load the CSV file using Pandas
    countries_df = pd.read_csv("static/data/countries.csv")

    # Find the row with the matching country name
    country_row = countries_df.loc[countries_df["name"] == country_name]

    # If no matching country was found, return an error message
    if country_row.empty:
        return {"error": "Country not found"}

    # Extract the latitude and longitude from the matching row
    latitude = country_row["latitude"].values[0]
    longitude = country_row["longitude"].values[0]

    # Return the latitude and longitude as a JSON object
    return {"latitude": latitude, "longitude": longitude}
