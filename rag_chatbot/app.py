from flask import Flask, request, jsonify, render_template
import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import io  # Import io for StringIO
from flask_cors import CORS
from os.path import join, dirname, abspath
from dotenv import load_dotenv
import os

dotenv_path = join(dirname(dirname(abspath(__file__))), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def preprocess_dataset(df):
    # Combine all columns into a single text column for vectorization
    df['combined'] = df.apply(lambda row: ' '.join(row.values.astype(str)), axis=1)
    return df

def retrieve_relevant_data(df, question, top_n=3):
    # Vectorize the dataset and the question
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])
    question_vector = vectorizer.transform([question])

    # Compute cosine similarity between the question and dataset rows
    similarities = cosine_similarity(question_vector, tfidf_matrix).flatten()
    df['similarity'] = similarities

    # Retrieve the top N most relevant rows
    relevant_data = df.nlargest(top_n, 'similarity')
    return relevant_data.drop(columns=['combined', 'similarity'])

# @app.route('/')
# def home():
#     return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    fileName = data['fileName']
    question = data['question']

    val = pd.read_csv(f"../uploads/{fileName}", low_memory=False)  
    val_subset = val.head(20000)

    # Load dataset into a pandas DataFrame using io.StringIO
    df = pd.read_csv(io.StringIO(val_subset.to_string()))
    df = preprocess_dataset(df)

    # Retrieve relevant data using RAG
    relevant_data = retrieve_relevant_data(df, question)
    relevant_data_str = relevant_data.to_string()

    # Pass the user's question and relevant data directly to Gemini Pro
    prompt = f"Your are an network anomaly detecting AI model named AnomalyX Here is some relevant data from the dataset:\n{relevant_data_str}\n\nQuestion: {question}" 

    # Call Gemini Pro API
    headers = {
        "Content-Type": "application/json",
    }
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    response = requests.post(
        f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
        headers=headers,
        json=payload
    )
    response_data = response.json()

    # Extract the answer
    answer = response_data['candidates'][0]['content']['parts'][0]['text']

    return jsonify({"answer": answer})

if __name__ == '__main__':
    app.run(debug=True, port=8000)