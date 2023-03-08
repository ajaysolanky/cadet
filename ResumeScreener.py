import json
import os
import faiss
import numpy as np

from OpenAIQuery import OpenAIQuery
from langchain.chains import VectorDBQAWithSourcesChain
from langchain.text_splitter import TokenTextSplitter, SpacyTextSplitter, NLTKTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.docstore.document import Document
from langchain.vectorstores import FAISS
from langchain import OpenAI

class ResumeScreener:
    def construct_prompt_sample(self, resume_text, qualifications, answer_li=None):
        qual_list = ', '.join(qualifications)
        prompt_intro = f"I am evaluating the resume below. I am looking for a candidate with the following qualifications: [{qual_list}]. List out which of these qualifications the candidate possesses, that are directly mentioned in their resume:"
        constructed = f"PROMPT:\n{prompt_intro}\n\nRESUME:\n{resume_text}\n\nANSWER:"
        if answer_li:
            answer_text = "\n".join(f"* {qual}: {res}" for qual, res in answer_li)
            constructed+=f"\n{answer_text}"
        return constructed
    
    def construct_full_prompt(self, resume_text, qualifications):
        sample_data = self.get_learning_samples()
        chunks = []
        for sd in sample_data:
            chunks.append(self.construct_prompt_sample(
                sd["resume_text"],
                sd["qualifications"],
                sd["answer_li"]
            ))
        chunks.append(self.construct_prompt_sample(
            resume_text,
            qualifications
        ))
        return '\n\n###\n\n'.join(chunks)

    def get_learning_samples(self):
        with open('./resume_screening_samples.json') as f:
            return json.load(f)
    
    def get_analysis(self, resume_text, qualifications):
        full_prompt = self.construct_full_prompt(resume_text, qualifications)
        return OpenAIQuery().make_query_chat_gpt(full_prompt)
    
class ResumeScreenerEmbeddingApproach(ResumeScreener):
    CHUNK_SIZE_TOKENS = 50
    CHUNK_OVERLAP_TOKENS = int(CHUNK_SIZE_TOKENS * .3)
    NUM_RETRIEVE_SPLITS = 4

    def construct_prompt_sample(self, resume_text, qualification, answer=None):
        pass

    def construct_full_prompt(self, resume_text, qualifications):
        pass

    def get_learning_samples(self):
        pass

    def get_analysis(self, resume_text, qualifications, resume_doc=None):
        text_splitter = NLTKTextSplitter(
            chunk_size=self.CHUNK_SIZE_TOKENS,
            chunk_overlap=self.CHUNK_OVERLAP_TOKENS
            )
        splits = text_splitter.split_text(resume_text)
        vdb = VectorDB(splits)

        results = []
        for qual in qualifications:
            embedding = vdb.get_embedding(qual)
            
            _, indices = vdb.store.index.search(np.array([embedding], dtype=np.float32), self.NUM_RETRIEVE_SPLITS)

            docs = []
            for i in indices[0]:
                if i == -1:
                    # This happens when not enough docs are returned.
                    continue
                _id = vdb.store.index_to_docstore_id[i]
                doc = vdb.store.docstore.search(_id)
                if not isinstance(doc, Document):
                    raise ValueError(f"Could not find document for id {_id}, got {doc}")
                docs.append(doc)

            chosen_sections = []
            for doc in docs:
                doc_text = doc.page_content
                chosen_sections.append("\n* " + doc_text.replace("\n", " "))

            for doc in docs:
                text = doc.page_content
                for page in resume_doc:
                    text_instances = page.search_for(text)
                    for inst in text_instances:
                        highlight = page.add_highlight_annot(inst)
                        highlight.update()
            
            resume_doc.save("output.pdf", garbage=4, deflate=True, clean=True)

            prompt_template = """Given the fragments of text extracted from a resume below, evaluate whether the candidate has the following qualification: {qual} . Only evaluate the candidate based on the extracted fragments, and if there is not extremely strong evidence they possess the qualification, just say "NO." and nothing after that.\n\nEXTRACTED FRAGMENTS:{chunks}"""

            prompt = prompt_template.format(
                qual=qual,
                chunks="".join(chosen_sections)
            )

            results.append(OpenAIQuery().make_query_chat_gpt(prompt))
        
        return results

        # splits = 
        
        # prompt_li = self.construct_prompt(resume)
        # full_prompt = self.construct_full_prompt(resume_text, qualifications)
        # return OpenAIQuery().make_query_chat_gpt(full_prompt)

class VectorDB:
    def __init__(self, texts):
        self.store = FAISS.from_texts(texts, OpenAIEmbeddings(), metadatas=[{"source":txt} for txt in texts])            
    
    def get_embedding(self, text):
        return self.store.embedding_function(text)
