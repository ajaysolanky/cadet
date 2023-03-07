import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextareaAutosize from 'react-textarea-autosize';
import { useSelector, useDispatch } from 'react-redux'
import { setQuals, resetQuals } from '../jobSlice'

const CandidateResponse = () => {
  const candidateName = "Yamini Bhandari";
  const candidateEmail = "Hi,\nYes, I'd be interested -- can you give me some more info? What's the exact title of the position, and would you need me to come into the office? Also what are the expected working hours?\nThanks,\nYamini";

  const companyName = useSelector((state) => state.job.companyName);
  const companyDescription = useSelector((state) => state.job.companyDescription);
  const teamName = useSelector((state) => state.job.teamName);
  const teamDescription = useSelector((state) => state.job.teamDescription);
  const jobTitle = useSelector((state) => state.job.jobTitle);

  const [emailBody, setEmailBody] = useState("");
  const [amendmentText, setAmendmentText] = useState("");

  const onSubmitAmendment = () => {
    const requestOptions = {
        method: 'GET',
        // mode: "no-cors",
        headers: {'Content-Type': 'application/json'},
      }
    const type = 'candidate_response'
    var url = `http://192.168.1.240:105/amendment?textBody=${encodeURIComponent(emailBody)}&type=${type}&instructions=${amendmentText}`
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => setEmailBody(data['response']))
  }

  const onSubmitGenerate = () => {
    // var data = new FormData();
    var payload = {
        "job_details": [
            'company name', companyName,
            'company description', companyDescription,
            'team name', teamName,
            'team description', teamDescription,
            'job title', jobTitle
        ],
        "candidate_email": candidateEmail
    }
    const requestOptions = {
      method: 'GET',
      // mode: "no-cors",
      headers: {'Content-Type': 'application/json'},
    }
    var url = 'http://192.168.1.240:105/responseemail?'
    for (const [key, value] of Object.entries(payload)) {
      url += `${key}=${encodeURIComponent(value)}&`;
    }
    console.log(url)
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => setEmailBody(data['response']))
  }

  return (
    <>
      <h1>{candidateName} just replied!</h1>
      <p>Here's their email response</p>
      <TextareaAutosize
        name="candidateEmail"
        value={candidateEmail}
        style={{'width': 800}}
        /><br /><br />
      <button onClick={onSubmitGenerate}>Generate Response Email:</button><br /><br />
      <TextareaAutosize
        name="body"
        onChange={(e) => setEmailBody(e.target.value)}
        value={emailBody}
        style={{'width': 800}}
        /><br /><br />
      <form>
        <label>Make amendment:</label>
        <input
            type="text"
            value={amendmentText}
            onChange={(e) => setAmendmentText(e.target.value)}
          />
      </form>
      <button onClick={onSubmitAmendment}>Ask for amendment</button><br /><br />
      <button onClick={() => alert('email sent!')}>Send Email</button>
    </>
  );
};

export default CandidateResponse;
