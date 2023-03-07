from OpenAIQuery import OpenAIQuery

class OutreachEmailer:
    def construct_prompt(self, candidate_details_dict, job_details_dict):
        context = ""
        for k, v in (candidate_details_dict | job_details_dict).items():
            context += f"* {k}: {v}\n"
        prompt = f"""Write a recruiter outreach article to ask whether a candidate is interested in a job you are advertising. Make it sound peppy and upbeat. Make it brief.
CONTEXT:
{context}

EMAIL:"""
        return prompt
    
    def get_email_text(self, candidate_details_dict, job_details_dict):
        prompt = self.construct_prompt(candidate_details_dict, job_details_dict)
        return OpenAIQuery().make_query_chat_gpt(prompt)

    def send_email(self):
        pass
