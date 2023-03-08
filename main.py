# from langchain.document_loaders import PagedPDFSplitter
import json
import fitz

from JDWriter import JDWriter
from ResumeScreener import ResumeScreener
from OutreachEmailer import OutreachEmailer
from ResponseEmailer import ResponseEmailer
from OpenAIQuery import OpenAIQuery

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# CORS(app)

@app.route('/getjd', methods=['GET'])
def get_jd():
    data = request.args
    jd_desc_keys = [
        "job_title",
        "company_name",
        "company_description",
        "team_name",
        "team_description",
        "necessary_skills",
        "preferred_skills"
    ]

    print('keys: %s' % data.keys())

    query_dict = {key: data[key] for key in jd_desc_keys}

    print('uh ohhhh')

    jd_writer = JDWriter()
    jd_text = jd_writer.get_jd(query_dict)

#     jd_text = """Chunky Funky Monkey is seeking a Principal Data Scientist to join our Customer Success team. As a data-driven company, we are committed to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase. 

# Responsibilities:
# - Develop and implement data-driven solutions to improve customer experience and retention
# - Collaborate with cross-functional teams to identify and prioritize business problems and opportunities
# - Build and maintain large-scale distributed systems to support data analysis and modeling
# - Develop and maintain software engineering best practices and agile development methodologies
# - Conduct data analysis using SQL and other tools to extract insights and drive decision-making

# Requirements:
# - Bachelor's or Master's degree in Computer Science, Statistics, or related field
# - 5+ years of experience in software engineering and data science
# - Proficiency in Python and experience with large-scale distributed systems
# - Experience with agile development methodologies
# - Strong problem-solving skills and ability to work collaboratively with cross-functional teams

# Preferred:
# - Experience with SQL and data analysis
# - Experience in e-commerce or consumer-facing industries

# If you are passionate about using data to drive business decisions and are excited about the opportunity to work with a dynamic and innovative team, we encourage you to apply for this role."""
    
    response = jsonify({"response": jd_text})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

@app.route('/evalcandidate', methods=['GET'])
def eval_candidate():
    data = request.args
    keys = ['name', 'quals']
    try:
        [data[k] for k in keys]
    except:
        raise Exception('key not found')
    pdf_dict = {
        'Ajay Solanky': './ajay_resume.pdf',
        'Aalhad Patankar': './aal_resume.pdf',
        'Yamini Bhandari': './yb_resume.pdf'
    }
    pdf_path = pdf_dict[data['name']]
    doc = fitz.open(pdf_path)
    resume_text = ""
    for page in doc:
        resume_text += page.get_text()
    # loader = PagedPDFSplitter(pdf_path)
    # pages = loader.load_and_split()
    # resume_text = pages[0].page_content # missing the other pages
    resume_screener = ResumeScreener()
    analysis = resume_screener.get_analysis(resume_text, data['quals'].split(','), resume_doc=doc)
    bullets = [s.strip() for s in analysis.split('*') if s.strip()]
    analysis_formatted = ''.join(['*'+b for b in bullets])

    print(analysis_formatted)

    # analysis_formatted="*Software Engineering: None mentioned*Ivy League Education: Yes, the candidate has a Masters in Business Administration from Harvard Business School and a Bachelor of Science from Cornell University.*HR: Yes, the candidate has experience in HR, having created and executed all core HR functions, including recruiting, onboarding, benefits enrollment, and employee relations from scratch at US Bitcoin Corporation."

    response = jsonify({"response": analysis_formatted})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

@app.route('/outreachemail', methods=['GET'])
def outreach_email_handler():
    data = request.args
    outreach_emailer = OutreachEmailer()

    cdl = data['candidate_details'].split(",")
    candidate_details_dict = {}
    i = 0
    while i < len(cdl):
        candidate_details_dict[cdl[i]] = cdl[i+1]
        i += 2

    jdl = data['job_details'].split(",")
    job_details_dict = {}
    i = 0
    while i < len(jdl):
        job_details_dict[jdl[i]] = jdl[i+1]
        i += 2

    outreach_email = outreach_emailer.get_email_text(candidate_details_dict, job_details_dict)

    print(outreach_email)

    response = jsonify({"response": outreach_email})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

@app.route('/responseemail', methods=['GET'])
def response_email_handler():
    data = request.args
    response_emailer = ResponseEmailer()

    jdl = data['job_details'].split(",")
    job_details_dict = {}
    i = 0
    while i < len(jdl):
        job_details_dict[jdl[i]] = jdl[i+1]
        i += 2

    candidate_email_text = data['candidate_email']

    response_email = response_emailer.get_response_email_text(job_details_dict, candidate_email_text, "https://calendly.com/ajaysolanky/30min")

    print(response_email)

    response = jsonify({"response": response_email})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

@app.route('/amendment', methods=['GET'])
def amendment_handler():
    data = request.args

    amend_type = data["type"]
    text = data["textBody"]
    instructions = data["instructions"]
    
    type_dict = {
        "candidate_response": {
            "action": "responding to an email from a candidate",
            "text_type": "email response",
            "addtl_instruct": ", preserving bullet point structure"
        },
        "write_jd": {
            "action": "writing a job description",
            "text_type": "job description",
            "addtl_instruct": ", preserving bullet point structure"
        }
    }

    action = type_dict[amend_type]['action']
    text_type = type_dict[amend_type]['text_type']
    addtl_instruct = type_dict[amend_type].get('addtl_instruct')

    prompt = f"""You are a recruiter {action}. amend the following {text_type} with the following intructions: {instructions}{addtl_instruct}:\n\n{text}"""

    response = OpenAIQuery().make_query_chat_gpt(prompt)

    print(response)

    response = jsonify({"response": response})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)

def main():
    ### WRITE JD ###
    # jd_desc_dict = {}
    # print("What is the name of the company?")
    # jd_desc_dict["company_name"] = input()
    # print("List the skills you are seeking for this role")
    # jd_desc_dict["necessary_skills"] = input()
    # print("List the preferred skills you are seeking for this role")
    # jd_desc_dict["preferred_skills"] = input()
    # print("What is the job title?")
    # jd_desc_dict["job_title"] = input()
    # print("What is the name of the team?")
    # jd_desc_dict["team_name"] = input()
    # print("What's the team description?")
    # jd_desc_dict["team_description"] = input()
    # print("What's the company description?")
    # jd_desc_dict["company_description"] = input()

    # print(jd_desc_dict)

    jd_desc_dict = {'company_name': 'Chunky Funky Monkey', 'necessary_skills': ['software engineering','python','agile development','large-scale distributed systems'], 'preferred_skills': ['SQL','data analysis'], 'job_title': 'Principal Data Scientist', 'team_name': 'Customer Success', 'team_description': 'The Customer Success Team takes a data-driven approach to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase', 'company_description': 'Chunky Funky Monkey is an online d2c brand, serving delicious chunky cookies to customers around the world'}

    jd_writer = JDWriter()
    # jd_text = jd_writer.get_jd(jd_desc_dict)
    # print(jd_text)

    jd_text = """Chunky Funky Monkey is seeking a Principal Data Scientist to join our Customer Success team. As a data-driven company, we are committed to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase. 

    Responsibilities:
    - Develop and implement data-driven solutions to improve customer experience and retention
    - Collaborate with cross-functional teams to identify and prioritize business problems and opportunities
    - Build and maintain large-scale distributed systems to support data analysis and modeling
    - Develop and maintain software engineering best practices and agile development methodologies
    - Conduct data analysis using SQL and other tools to extract insights and drive decision-making

    Requirements:
    - Bachelor's or Master's degree in Computer Science, Statistics, or related field
    - 5+ years of experience in software engineering and data science
    - Proficiency in Python and experience with large-scale distributed systems
    - Experience with agile development methodologies
    - Strong problem-solving skills and ability to work collaboratively with cross-functional teams

    Preferred:
    - Experience with SQL and data analysis
    - Experience in e-commerce or consumer-facing industries

    If you are passionate about using data to drive business decisions and are excited about the opportunity to work with a dynamic and innovative team, we encourage you to apply for this role."""

    ### POST JD ###

    # TODO: post the JD

    ### SCREEN RESUME ###

    candidate_resumes_fnames = [
        "./aal_resume.pdf",
        # "./ajay_resume.pdf",
        # "./yb_resume.pdf"
        ]
    
    qualifications = jd_desc_dict["necessary_skills"] + jd_desc_dict["preferred_skills"]
    resume_screener = ResumeScreener()
    analyses = []
    for resume in candidate_resumes_fnames:
        loader = PagedPDFSplitter(resume)
        pages = loader.load_and_split()
        resume_text = pages[0].page_content # missing the other pages
        # analysis = resume_screener.get_analysis(resume_text, qualifications)
        analysis = """* Software Engineering: Yes, the candidate has experience in software engineering, including positions at Apple and Yahoo!, and a degree in Computer Science from Columbia University.
        * Python: None mentioned
        * Agile Development: None mentioned, but the candidate does have experience leading teams and developing features from product design and development phase to ship.
        * Large-Scale Distributed Systems: None mentioned, but the candidate does have experience leading teams across mobile and backend to prototype, develop, and ship new cross-platform products.
        * SQL: None mentioned
        * Data Analysis: None mentioned, but the candidate does have experience instrumenting analytics infrastructure to identify and drive P0 bug fixes."""
        analyses.append(analysis)

    ### INTERVIEW REQUEST ###

    candidate_details_dict = {
        "name": "Aalhad Patankar",
        "reason for outreach": "impressive work experience building at Apple"
    }

    job_details_dict = {
        "company name": "Chunky Funky Monkey",
        "job title": "Principal Software Engineer",
        "company description": "Chunky Funky Monkey is a D2C brand that sells delicious cookies across the world",
        "team name": "Mobile Experiences Team",
        "team description": "The mobile experiences team is responsible for building Chunky Funky Monkey's world class mobile apps on iOS and Android",
        "recruiter name": "Davy Crockett"
    }

    outreach_emailer = OutreachEmailer()
    # outreach_email = outreach_emailer.get_email_text(candidate_details_dict, job_details_dict)
    outreach_email = """Hi Aalhad!

I hope this message finds you well. My name is Davy Crockett and I'm a recruiter at Chunky Funky Monkey. I came across your impressive work experience building at Apple and I wanted to reach out to see if you might be interested in a new opportunity.

We're currently looking for a Principal Software Engineer to join our Mobile Experiences Team. As a D2C brand that sells delicious cookies across the world, we're passionate about creating world class mobile apps on iOS and Android. We think your experience would be a great fit for our team!

If you're interested in learning more about the role, please let me know and we can set up a time to chat. I'm excited to hear from you!

Best,
Davy"""

    ### handle responses ###
    candidate_email_text = """Hi,
Yes, I'd be interested -- can you give me some more info? What's the exact title of the position, and would you need me to come into the office? Also what are the expected working hours?
Thanks,
Aalhad"""

    response_emailer = ResponseEmailer()

    # candidate_interested = response_emailer.eval_candidate_interest(candidate_email_text)
    response_email = response_emailer.get_response_email_text(job_details_dict, candidate_email_text, "https://calendly.com/ajaysolanky/30min")
    print(response_email)

# main()