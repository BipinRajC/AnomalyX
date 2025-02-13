import torch
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForCausalLM, AutoTokenizer

class RAGEngine:
    def __init__(self, dataset_path):
        # Load dataset
        self.df = pd.read_csv(dataset_path)
        
        # Prepare text representation
        self.prepare_text_representation()
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['text_representation'])
        
        # Load DeepSeek Model
        self.model_name = "deepseek-ai/deepseek-coder-1.3b-base"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name, 
            torch_dtype=torch.float16,
            device_map='auto'
        )
    
    def prepare_text_representation(self):
        # Create textual representations of rows
        self.df['text_representation'] = self.df.apply(
            lambda row: f"Source IP: {row['srcip']}, "
                        f"Destination IP: {row['dstip']}, "
                        f"Protocol: {row['proto']}, "
                        f"State: {row['state']}, "
                        f"Attack Category: {row.get('attack_cat', 'Unknown')}, "
                        f"Source Bytes: {row['sbytes']}, "
                        f"Destination Bytes: {row['dbytes']}",
            axis=1
        )
    
    def retrieve_context(self, query, top_k=3):
        # Vectorize the query
        query_vector = self.vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]
        
        # Get top-k most similar indices
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        # Return retrieved contexts
        return self.df.iloc[top_indices]
    
    def generate_response(self, query, retrieved_context):
        # Prepare context string
        context_str = "\n".join([
            f"Context {i+1}: {row['text_representation']}" 
            for i, row in retrieved_context.iterrows()
        ])
        
        # Prepare prompt for DeepSeek
        prompt = f"""Network Security Insights Chatbot

Query: {query}

Retrieved Contexts:
{context_str}

Provide a detailed and helpful response based on the retrieved network security information. 
Be concise, informative, and focus on the key insights from the context."""
        
        try:
            # Tokenize the prompt
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            # Generate response
            outputs = self.model.generate(
                inputs.input_ids, 
                max_length=500, 
                num_return_sequences=1,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )
            
            # Decode the response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract the model's response (remove the original prompt)
            clean_response = response[len(prompt):].strip()
            
            return clean_response
        
        except Exception as e:
            return f"Error generating response: {str(e)}"