import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextareaAutosize from 'react-textarea-autosize';
import { useSelector, useDispatch } from 'react-redux'
import Collapsible from 'react-collapsible';

const RequestInterview = () => {
  const companyName = useSelector((state) => state.job.companyName);
  const companyDescription = useSelector((state) => state.job.companyDescription);
  const teamName = useSelector((state) => state.job.teamName);
  const teamDescription = useSelector((state) => state.job.teamDescription);
  const jobTitle = useSelector((state) => state.job.jobTitle);

  const candidateData = [
    {"candidate name":"Ajay Solanky", "relevant company": "SmartNews"},
    {"candidate name":"Yamini Bhandari", "relevant company": "Harvard Business School"}
  ]

  const [emailBody, setEmailBody] = useState("");

  const onSubmitGenerate = () => {
    // var data = new FormData();
    var payload = {
        "candidate_details": [],
        "job_details": [
            'company name', companyName,
            'company description', companyDescription,
            'team name', teamName,
            'team description', teamDescription,
            'job title', jobTitle
        ]
    }
    // var payload = {'company_name': 'Chunky Funky Monkey', 'necessary_skills': ['software engineering','python','agile development','large-scale distributed systems'], 'preferred_skills': ['SQL','data analysis'], 'job_title': 'Principal Data Scientist', 'team_name': 'Customer Success', 'team_description': 'The Customer Success Team takes a data-driven approach to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase', 'company_description': 'Chunky Funky Monkey is an online d2c brand, serving delicious chunky cookies to customers around the world'};
    // data.append( "json", JSON.stringify( payload ) );
    const requestOptions = {
      method: 'GET',
      // mode: "no-cors",
      headers: {'Content-Type': 'application/json'},
      // body: data
      // body: JSON.stringify({'company_name': 'Chunky Funky Monkey', 'necessary_skills': ['software engineering','python','agile development','large-scale distributed systems'], 'preferred_skills': ['SQL','data analysis'], 'job_title': 'Principal Data Scientist', 'team_name': 'Customer Success', 'team_description': 'The Customer Success Team takes a data-driven approach to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase', 'company_description': 'Chunky Funky Monkey is an online d2c brand, serving delicious chunky cookies to customers around the world'})
    }
    var url = 'http://127.0.0.1:105/outreachemail?'
    for (const [key, value] of Object.entries(payload)) {
      url += `${key}=${encodeURIComponent(value)}&`;
    }
    console.log(url)
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => setEmailBody(data['response']))
  }

  return (
    <div>
      <h1>Let's reach out to our selected candidates:</h1>
      <button onClick={onSubmitGenerate}>Generate Outreach Email:</button><br /><br />
      <TextareaAutosize
        name="body"
        onChange={(e) => setEmailBody(e.target.value)}
        value={emailBody}
        style={{'width': 800}}
        /><br /><br />
      {candidateData.map((el, idx) => (
        <Collapsible trigger={el['candidate name']} triggerStyle={{"background": "pink", "width": "100vh"}}>
            <ul>
                <li><b>candidate name:</b> {el['candidate name']}</li>
                <li><b>relevant company:</b> {el['relevant company']}</li>
            </ul>
            <p>{emailBody.replace('[candidate name]', el['candidate name']).replace('[relevant company]', el['relevant company']).replace('[recruiter name]','Chuck E. Cheese')}</p>
        </Collapsible>
      ))}
      <Link to="/candidateresponse"><button>Send Email</button></Link>
    </div>
  );
};

export default RequestInterview;
