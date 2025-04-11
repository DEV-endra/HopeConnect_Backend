from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    query:str

app = FastAPI()

with open("chunks.txt") as f:
    chunks = [line.strip() for line in f.readlines()]

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
import numpy as np


vectorizer = TfidfVectorizer()
chunk_vectors = vectorizer.fit_transform(chunks)

def get_top_k_chunks(query, k=3):
    query_vector = vectorizer.transform([query])
    similarities = cosine_similarity(query_vector, chunk_vectors).flatten()
    top_indices = similarities.argsort()[-k:][::-1]
    return [chunks[i] for i in top_indices]


genai.configure(api_key="AIzaSyBHz0r-tP9A3xoyuRAO15gV4sLy4tv1PZQ")
model = genai.GenerativeModel("gemini-1.5-pro")

def ask_gemini(query, context_chunks):
    context = "\n".join(context_chunks)
    prompt = f"""You are an assistant helping users based on the following context.

Context:
{context}

Question:
{query}

Answer:"""
    response = model.generate_content(prompt)
    return response.text


@app.post("/philosophy/")
async def generate(item:Item):
    top_chunks = get_top_k_chunks(item.query, k=3)
    response = ask_gemini(item.query, top_chunks)
    return {"answer": response}




