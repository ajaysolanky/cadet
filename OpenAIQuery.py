import openai
import os

openai.api_key = os.getenv('OAI_TK', 'not the token')

# TODO: try adding a system role as a tech recruiter
class OpenAIQuery:
    def make_query_chat_gpt(self, prompt, system_role=None):
        max_response_tokens = 1000
        chat_model = "gpt-3.5-turbo"
        chat_api_params = {
            "temperature": 0.0,
            "max_tokens": max_response_tokens,
            "model": chat_model
        }
        messages = [{"role": "user", "content": prompt}]
        if system_role:
            messages.insert(0, {"role": "system", "content": system_role})
        response = openai.ChatCompletion.create(
            messages=messages,
            **chat_api_params
        )
        return response['choices'][0]['message']['content']
