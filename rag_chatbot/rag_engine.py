from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)
CORS(app)

# Initialize RAG Engine
class RAGEngine:
    def __init__(self, dataset_path):
        self.df = pd.read_csv(dataset_path, dtype=str, low_memory=False)
        self.df.columns = self.df.columns.str.strip().str.lower()
        self.prepare_text_representation()
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['text_representation'])
        self.model_name = "deepseek-ai/deepseek-coder-1.3b-base"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name, 
            torch_dtype=torch.float16,
            trust_remote_code=True
        ).to("cuda" if torch.cuda.is_available() else "cpu")

    def prepare_text_representation(self):
        self.df['text_representation'] = self.df.apply(
            lambda row: f"Source IP: {row.get('srcip', 'Unknown')}, "
                        f"Destination IP: {row.get('dstip', 'Unknown')}, "
                        f"Protocol: {row.get('proto', 'Unknown')}, "
                        f"State: {row.get('state', 'Unknown')}, "
                        f"Attack Category: {row.get('attack_cat', 'Unknown')}, "
                        f"Source Bytes: {row.get('sbytes', 'Unknown')}, "
                        f"Destination Bytes: {row.get('dbytes', 'Unknown')}",
            axis=1
        )


    def retrieve_context(self, query, top_k=3):
        query_vector = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]
        top_indices = similarities.argsort()[-top_k:][::-1]
        return self.df.iloc[top_indices]

    def generate_response(self, query, retrieved_context):
        context_str = "\n".join([
            f"Context {i+1}: {row['text_representation']}" for i, row in retrieved_context.iterrows()
        ])
        prompt = f"""Network Security Insights Chatbot

Query: {query}

Retrieved Contexts:
{context_str}

Provide a detailed and helpful response based on the retrieved network security information."""
        try:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            outputs = self.model.generate(
                inputs.input_ids, 
                max_length=500, 
                num_return_sequences=1,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            clean_response = response[len(prompt):].strip()
            return clean_response
        except Exception as e:
            return f"Error generating response: {str(e)}"

rag_engine = RAGEngine("dataset.csv")

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    print(data)
    query_text = data.get("query", "")
    print(query_text)
    if not query_text:
        return jsonify({"error": "Query is required"}), 400
    
    retrieved_context = rag_engine.retrieve_context(query_text)
    response = rag_engine.generate_response(query_text, retrieved_context)
    return jsonify({"query": query_text, "response": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
