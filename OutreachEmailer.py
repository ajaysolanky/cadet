from OpenAIQuery import OpenAIQuery

class OutreachEmailer:
    OPENAI_TEMPERATURE = 0.5
    def construct_prompt(self, job_details_dict):
        context = ""
        for k, v in job_details_dict.items():
            context += f"* {k}: {v}\n"
        prompt = f"""Write a recruiter outreach article to ask whether a candidate is interested in a job you are advertising. Make it sound peppy and upbeat. Make it brief. Draw from the context below, and make sure to insert tags for: [candidate name], [relevant company], [recruiter name]. The tag [relevant company] refers to a company the candidate has worked at that has given them relevant experience. Do not include a subject line.
CONTEXT:
{context}

EMAIL:"""
        return prompt
    
    def get_email_text(self, job_details_dict):
        prompt = self.construct_prompt(job_details_dict)
        print(prompt)
        return OpenAIQuery().make_query_chat_gpt(prompt, temperature=self.OPENAI_TEMPERATURE)

    def send_email(self):
        pass
