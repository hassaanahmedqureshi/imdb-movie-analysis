import pandas as pd
import json as json

from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances

# Load the movie data into a pandas DataFrame
movies_df = pd.read_csv('static/data/movies.csv')

# Select the relevant features
features = ['genre', 'director', 'star']

# Transform the categorical data into numerical data
numerical_data = pd.get_dummies(movies_df[features])

# Calculate the similarity matrix
similarity_matrix = pairwise_distances(numerical_data, metric='euclidean')

# Perform MDS analysis
mds = MDS(n_components=2, dissimilarity='precomputed', normalized_stress='False')
mds_results = mds.fit_transform(similarity_matrix)

# Output the MDS results as a JSON file
mds_results_dict = {
    'x': mds_results[:, 0].tolist(), 'y': mds_results[:, 1].tolist()}
with open('mds_results.json', 'w') as f:
    json.dump(mds_results_dict, f)
