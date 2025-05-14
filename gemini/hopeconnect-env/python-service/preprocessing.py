import fitz
import os


def extract():
    doc=fitz.open("book1.pdf")
    text=" "
    for page in doc:
        text+=page.get_text()

    doc2=fitz.open("book2.pdf")
    for page in doc2:
        text+=page.get_text()

    doc3=fitz.open("book3.pdf")
    for page in doc3:
        text+=page.get_text()

    return text

text=extract()

def split_text(text, chunk_size=300):
    words = text.split()
    chunks=[]
    for i in range(0,len(words),chunk_size):
        curr = ' '.join(words[i:i+chunk_size])
        chunks.append(curr)
    return chunks

chunks = split_text(text)

with open("chunks.txt", "w", encoding="utf-8") as f:
    for chunk in chunks:
        f.write(chunk.strip() + "\n")

