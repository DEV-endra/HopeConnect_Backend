from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class Item(BaseModel):
    query:str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hopeconnect-backend.onrender.com","https://hopeconnect.onrender.com"], 
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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

genai.configure(api_key="AIzaSyAVHUfYtR9d6Ax3Pbw9-bkiWB1gGEmtxAQ")
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

def ask_gemini(query, context_chunks):
    context = "\n".join(context_chunks)
    prompt = f"""you are an assistant helping users on topics like mental health ,depression and related ones,be empathetic like humans ,help them and provide them guidance . below given is some context from some of the resources i had use them to provide assistance if something related and useful is there otherwise do it on your own , after that there will be a query from the user you have to help out

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




