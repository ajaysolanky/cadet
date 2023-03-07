import os

from OpenAIQuery import OpenAIQuery

class JDWriter:
    def __init__(self):
        pass

    def get_prompt(self, job_info):
        return f"""Write a Job Description to advertise the following role. Make it sound natural, and make sure to introduce what the company does and what the team is responsible for. Use bullet points where possible:

            CONTEXT:
            - TITLE: {job_info["job_title"]}
            - TEAM: {job_info["team_name"]}
            - TEAM DESCRIPTION {job_info["team_description"]}
            - COMPANY: {job_info["company_name"]}
            - COMPANY DESCRIPTION: {job_info["company_description"]}
            - NECESSARY SKILLS: {job_info["necessary_skills"]}
            - PREFERRED SKILLS: {job_info["preferred_skills"]}
            
            JOB DESCRIPTION:"""

    def get_jd(self, job_info):
        prompt = self.get_prompt(job_info)
        return OpenAIQuery().make_query_chat_gpt(prompt)
