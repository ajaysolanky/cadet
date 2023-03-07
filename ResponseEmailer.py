from OpenAIQuery import OpenAIQuery

class ResponseEmailer:
    def construct_prompt(self, job_details_dict, candidate_email_text, calendly_link):
        context = ""
        for k, v in job_details_dict.items():
            context += f"* {k}: {v}\n"
        context += f"* CALENDLY LINK: {calendly_link}"
        prompt = f"""You are a recruiter responding to emails. Below, in the CONTEXT section, is context about the company & role, and below that, in the EMAIL section, is the email you have to respond to. Only respond to the questions the candidate has asked, and nothing else. Use a peppy, upbeat tone. Keep the response brief. At the end of the email, provide the candidate with the Calendly link, and instruct them to book some time on your calendar. Use bullet points where possible.
CONTEXT:
{context}

EMAIL:
{candidate_email_text}

RESPONSE:"""

        return prompt
    
    def get_response_email_text(self, job_details_dict, candidate_email_text, calendly_link):
        prompt = self.construct_prompt(job_details_dict, candidate_email_text, calendly_link)
        return OpenAIQuery().make_query_chat_gpt(prompt)
    
    def send_response_email(self):
        pass

    def eval_candidate_interest(self, candidate_email_text):
        prompt = f"""You are a recruiter who has received the following email from a candidate following your outreach attempt about a role:
EMAIL:
{candidate_email_text}

Is this candidate interested in this role? Respond verbatim with "!YES!" , "!NO!", or "!UNSURE!" and nothing else.

INTERESTED:"""
        response = OpenAIQuery().make_query_chat_gpt(prompt)
        return "!NO!" not in response