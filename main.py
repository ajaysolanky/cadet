# from langchain.document_loaders import PagedPDFSplitter
import json
import fitz

from JDWriter import JDWriter
from ResumeScreener import ResumeScreener
from OutreachEmailer import OutreachEmailer
from ResponseEmailer import ResponseEmailer
from OpenAIQuery import OpenAIQuery
from utils import GhettoDiskCache

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

@app.route('/getjd', methods=['GET'])
@cross_origin()
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
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:105')
    print(response)
    return response

@app.route('/evalcandidate', methods=['GET'])
def eval_candidate():
    # import pdb; pdb.set_trace()
    data = request.args
    keys = ['name', 'quals']
    try:
        [data[k] for k in keys]
    except:
        raise Exception('key not found')
    
    if not data['quals']:
        raise Exception('Quals missing')
    
    gdc = GhettoDiskCache()
    gdc_args = (data['name'], data['quals'])
    cached_val = gdc.check_cache(*gdc_args)
    if cached_val:
        return cached_val

    pdf_dict = {
        'Ajay Solanky': './resume_data/ajay_resume.pdf',
        'Aalhad Patankar': './resume_data/aal_resume.pdf',
        'Yamini Bhandari': './resume_data/yb_resume.pdf'
    }
    pdf_path = pdf_dict[data['name']]
    resume_doc = fitz.open(pdf_path)
    resume_screener = ResumeScreener()
    qualifications = data['quals'].split(',')
    overview_analysis = resume_screener.get_analysis(resume_doc, tuple(qualifications), print_prompt=True)
    oa_segments = [s.strip() for s in overview_analysis.split('*') if s.strip()]
    oa_dict = {}
    for seg in oa_segments:
        i = seg.index(':')
        skill = seg[:i].strip()
        desc = seg[i+1:].strip()
        oa_dict[skill.lower()] = desc
    # oa_formatted = ''.join(['*'+b for b in oa_bullets])
    print(oa_dict)

    highlight_analysis = resume_screener.get_highglight_data(resume_doc, tuple(qualifications))

    response_dict = {"response": {"overview_analysis": oa_dict, "highlights": highlight_analysis}}
    gdc.save_to_cache(response_dict, *gdc_args)
    response = jsonify(response_dict)
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

@app.route('/outreachemail', methods=['GET'])
def outreach_email_handler():
    data = request.args
    outreach_emailer = OutreachEmailer()

    cdl = data['candidate_details'].split(",")
    candidate_details_dict = {}
    # i = 0
    # while i < len(cdl):
    #     candidate_details_dict[cdl[i]] = cdl[i+1]
    #     i += 2

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
