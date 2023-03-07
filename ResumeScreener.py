import json

from OpenAIQuery import OpenAIQuery
from langchain.text_splitter import TokenTextSplitter

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
    CHUNK_OVERLAP = CHUNK_SIZE_TOKENS * .3
    def construct_prompt_sample(self, resume_text, qualification, answer=None):
        pass

    def construct_full_prompt(self, resume_text, qualifications):
        pass

    def get_learning_samples(self):
        pass

    def get_analysis(self, resume_text, qualifications):
        text_splitter = TokenTextSplitter(
            chunk_size=self.CHUNK_SIZE_TOKENS,
            chunk_overlap=self.CHUNK_OVERLAP_TOKENS
            )
        splits = text_splitter.split_text(resume_text)
        # splits = 
        
        # prompt_li = self.construct_prompt(resume)
        # full_prompt = self.construct_full_prompt(resume_text, qualifications)
        # return OpenAIQuery().make_query_chat_gpt(full_prompt)