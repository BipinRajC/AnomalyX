from flask import Flask, render_template, request, jsonify
from app.rag_engine import RAGEngine
import os
import torch

# Initialize Flask app
app = Flask(__name__)

# Initialize RAG Engine
dataset_path = os.path.join('data', 'dataset.csv')
rag_engine = RAGEngine(dataset_path)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_query = request.json.get('query', '')
    
    try:
        # Retrieve context
        retrieved_context = rag_engine.retrieve_context(user_query)
        
        # Generate response
        response = rag_engine.generate_response(user_query, retrieved_context)
        
        return jsonify({
            'response': response,
            'context': retrieved_context.to_dict(orient='records')
        })
    
    except Exception as e:
        return jsonify({
            'response': f"An error occurred: {str(e)}",
            'context': []
        }), 500

if __name__ == '__main__':
    app.run(debug=True)