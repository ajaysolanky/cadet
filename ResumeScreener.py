from collections import defaultdict
import json
import os
import random
import faiss
import numpy as np
from functools import lru_cache

from OpenAIQuery import OpenAIQuery
from langchain.chains import VectorDBQAWithSourcesChain
from langchain.text_splitter import TokenTextSplitter, SpacyTextSplitter, NLTKTextSplitter, RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.docstore.document import Document
from langchain.vectorstores import FAISS
from langchain import OpenAI

from utils import CustomNLTKTextSplitter

class ResumeScreener:
    CHUNK_SIZE = 150
    CHUNK_OVERLAP = int(CHUNK_SIZE * .2)
    NUM_RETRIEVE_SPLITS = 5
    MAX_VECTOR_DISTANCE = 0.5

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
    
    @lru_cache(maxsize=None)
    def get_analysis(self, resume_doc, qualifications, print_prompt=False):
        resume_text = ""
        for page in resume_doc:
            resume_text += page.get_text()
        full_prompt = self.construct_full_prompt(resume_text, qualifications)
        if print_prompt:
            print(full_prompt)
        return OpenAIQuery().make_query_chat_gpt(full_prompt)

    @lru_cache(maxsize=None)
    def get_highglight_data(self, resume_doc, qualifications):
        resume_text = ""
        for page in resume_doc:
            resume_text += page.get_text()

        if str(resume_doc) == "Document('./resume_data/ajay_resume.pdf')":
            print(str(resume_doc), 'case A')
            # text_splitter = NLTKTextSplitter(
            #     chunk_size=self.CHUNK_SIZE,
            #     chunk_overlap=self.CHUNK_OVERLAP
            #     )
            with open('./resume_data/ajay_resume_extracted.json') as f:
                texts_and_sources = json.load(f)
            texts, metadatas = list(zip(*texts_and_sources.items()))
        elif str(resume_doc) == "Document('./resume_data/yb_resume.pdf')":
            print(str(resume_doc), 'case B')
            with open('./resume_data/yb_resume_extracted.json') as f:
                texts_and_sources = json.load(f)
            texts, metadatas = list(zip(*texts_and_sources.items()))
        else:
            print(str(resume_doc), 'case C')
            #TODO: this doesn't really work because it gets rid of some key text, making it impossible to match
            text_splitter = CustomNLTKTextSplitter(
                chunk_size=self.CHUNK_SIZE,
                chunk_overlap=self.CHUNK_OVERLAP
                )
            texts = text_splitter.split_text(resume_text)
            metadatas = texts


        # text_splitter = RecursiveCharacterTextSplitter(
        #     chunk_size=self.CHUNK_SIZE_TOKENS, #TODO: this is not actually tokens now
        #     chunk_overlap=self.CHUNK_OVERLAP_TOKENS, #TODO: dont' think this actually does anything
        #     separators=["•","\n\n", "\n", " ", ""]
        #     )

        vdb = VectorDB(texts, metadatas)

        highlight_data = defaultdict(list)
        for qual in qualifications:
            docs = vdb.get_k_closest_docs(qual, k=self.NUM_RETRIEVE_SPLITS, max_distance=self.MAX_VECTOR_DISTANCE)

            # this part is currently functionless, but it is intended for
            # if we want to use this method to generate summary analysis
            # for each qualification
            chosen_sections = []
            for doc in docs:
                doc_text = doc.page_content
                chosen_sections.append("\n* " + doc_text.replace("\n", " "))

            print(chosen_sections)

            texts = set()
            for doc in docs:
                new_texts = set(doc.metadata["sources"]) - texts
                texts = texts | new_texts
                for text in new_texts:
                    for i, page in enumerate(resume_doc):
                        width = page.rect.x1
                        height = page.rect.y1
                        text_instances = page.search_for(text)
                        for inst in text_instances:
                            rect_dict = {
                                "x1": inst.x0,
                                "y1": inst.y0,
                                "x2": inst.x1,
                                "y2": inst.y1,
                                "height": height,
                                "width": width
                            }
                            # TODO: am I using boundingRect correctly? should there just be one for the whole section?
                            position_dict = {
                                "boundingRect": rect_dict,
                                "rects": [rect_dict],
                                "pageNumber": i+1
                            }
                            highlight_data[qual].append({
                                "content": {
                                    "text": text
                                },
                                "position": position_dict,
                                "comment": {
                                    "text": "",
                                    "emoji": ""
                                },
                                "id": str(random.randint(9999999,999999999999999))
                            })
            #                 highlight = page.add_highlight_annot(inst) # just for testing
            #                 highlight.update()
            
            # resume_doc.save("output.pdf", garbage=4, deflate=True, clean=True) # just for testing
        
        return highlight_data


# class ResumeScreenerEmbeddingApproach(ResumeScreener):
#     CHUNK_SIZE_TOKENS = 50
#     CHUNK_OVERLAP_TOKENS = int(CHUNK_SIZE_TOKENS * .3)
#     NUM_RETRIEVE_SPLITS = 4

#     def get_analysis(self, resume_doc, qualifications, print_prompt=False):
#         resume_text = ""
#         for page in resume_doc:
#             resume_text += page.get_text()

#         text_splitter = NLTKTextSplitter(
#             chunk_size=self.CHUNK_SIZE_TOKENS,
#             chunk_overlap=self.CHUNK_OVERLAP_TOKENS
#             )
#         splits = text_splitter.split_text(resume_text)
#         vdb = VectorDB(splits)
        
#         resume_id_dict = {
#             "Document('./ajay_resume.pdf')": "ajay",
#             "Document('./aal_resume.pdf')": "aal",
#             "Document('./yb_resume.pdf')": "yb"
#         }
#         resume_id = resume_id_dict[str(resume_doc)]

#         highlight_data = defaultdict(lambda: defaultdict(list))
#         results = []
#         for qual in qualifications:
#             embedding = vdb.get_embedding(qual)
            
#             _, indices = vdb.store.index.search(np.array([embedding], dtype=np.float32), self.NUM_RETRIEVE_SPLITS)

#             docs = []
#             for i in indices[0]:
#                 if i == -1:
#                     # This happens when not enough docs are returned.
#                     continue
#                 _id = vdb.store.index_to_docstore_id[i]
#                 doc = vdb.store.docstore.search(_id)
#                 if not isinstance(doc, Document):
#                     raise ValueError(f"Could not find document for id {_id}, got {doc}")
#                 docs.append(doc)

#             chosen_sections = []
#             for doc in docs:
#                 doc_text = doc.page_content
#                 chosen_sections.append("\n* " + doc_text.replace("\n", " "))

#             for doc in docs:
#                 text = doc.page_content
#                 for i, page in enumerate(resume_doc):
#                     width = page.rect.x1
#                     height = page.rect.y1
#                     text_instances = page.search_for(text)
#                     for inst in text_instances:
#                         rect_dict = {
#                             "x1": inst.x0,
#                             "y1": inst.y0,
#                             "x2": inst.x1,
#                             "y2": inst.y1,
#                             "height": height,
#                             "width": width
#                         }
#                         # TODO: am I using boundingRect correctly? should there just be one for the whole section?
#                         position_dict = {
#                             "boundingRect": rect_dict,
#                             "rects": [rect_dict],
#                             "pageNumber": i+1
#                         }
#                         highlight_data[resume_id][qual].append({
#                             "content": {
#                                 "text": text
#                             },
#                             "position": position_dict,
#                             "id": str(random.randint(9999999,999999999999999))
#                         })
#                         # highlight = page.add_highlight_annot(inst) # just for testing
#                         # highlight.update()
            
#             # resume_doc.save("output.pdf", garbage=4, deflate=True, clean=True) # just for testing

#             prompt_template = """Given the fragments of text extracted from a resume below, evaluate whether the candidate has the following qualification: {qual} . Only evaluate the candidate based on the extracted fragments, and if there is not extremely strong evidence they possess the qualification, just say "NO." and nothing after that.\n\nEXTRACTED FRAGMENTS:{chunks}"""

#             prompt = prompt_template.format(
#                 qual=qual,
#                 chunks="".join(chosen_sections)
#             )

#             if print_prompt:
#                 print(prompt)

#             results.append(OpenAIQuery().make_query_chat_gpt(prompt))
        
#         full_str = "\n".join([f"* {qual}: {result}" for qual, result in zip(qualifications, results)])
#         return full_str

#         # splits = 
        
#         # prompt_li = self.construct_prompt(resume)
#         # full_prompt = self.construct_full_prompt(resume_text, qualifications)
#         # return OpenAIQuery().make_query_chat_gpt(full_prompt)

class VectorDB:
    def __init__(self, texts, metadatas):
        self.store = FAISS.from_texts(texts, OpenAIEmbeddings(), metadatas=[{"sources":md} for md in metadatas])
    
    def get_embedding(self, text):
        return self.store.embedding_function(text)
    
    def get_k_closest_docs(self, query, k, max_distance=None):
        embedding = self.get_embedding(query)

        distances, indices = self.store.index.search(np.array([embedding], dtype=np.float32), k)
        distances = distances[0]
        indices = indices[0]

        i = 0
        for distance in distances:
            if max_distance and (distance > max_distance):
                break
            i += 1
        distances = distances[:i]
        indices = indices[:i]

        docs = []
        for i in indices:
            if i == -1:
                # This happens when not enough docs are returned.
                continue
            _id = self.store.index_to_docstore_id[i]
            doc = self.store.docstore.search(_id)
            if not isinstance(doc, Document):
                raise ValueError(f"Could not find document for id {_id}, got {doc}")
            docs.append(doc)
        
        return docs