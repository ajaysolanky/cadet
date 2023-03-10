import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextareaAutosize from 'react-textarea-autosize';
import { useSelector, useDispatch } from 'react-redux'
import { setQuals, resetQuals, setJobTitleRedux, setCompanyNameRedux, setCompanyDescriptionRedux, setTeamNameRedux, setTeamDescriptionRedux } from '../jobSlice'

const WriteJD = () => {
  const quals = useSelector((state) => state.job.quals);
  const jt = useSelector((state) => state.job.jobTitle);
  const cn = useSelector((state) => state.job.companyName);
  const cd = useSelector((state) => state.job.companyDescription);
  const tn = useSelector((state) => state.job.teamName);
  const td = useSelector((state) => state.job.teamDescription);
  const dispatch = useDispatch()
  
  const [jobTitle, setJobTitle] = useState(jt);
  const [companyName, setCompanyName] = useState(cn);
  const [companyDescription, setCompanyDescription] = useState(cd)
  const [teamName, setTeamName] = useState(tn);
  const [teamDescription, setTeamDescription] = useState(td);
  const [necessarySkills, setNecessarySkills] = useState("software engineering,data science,product management,SQL");
  const [preferredSkills, setPreferredSkills] = useState("Ivy League Education");

  const [amendmentText, setAmendmentText] = useState("");

  useEffect(() => {
    dispatch(setQuals(necessarySkills + ',' + preferredSkills))
  }, [necessarySkills, preferredSkills]);

  useEffect(() => {
    dispatch(setJobTitleRedux(jobTitle))
  }, [jobTitle]);

  useEffect(() => {
    dispatch(setCompanyNameRedux(companyName))
  }, [companyName]);

  useEffect(() => {
    dispatch(setCompanyDescriptionRedux(companyDescription))
  }, [companyDescription]);

  useEffect(() => {
    dispatch(setTeamNameRedux(teamName))
  }, [teamName]);

  useEffect(() => {
    dispatch(setTeamDescriptionRedux(teamName))
  }, [teamName]);

  const [jdBody, setJDBody] = useState("");

  const onSubmitAmendment = () => {
    const requestOptions = {
        method: 'GET',
        // mode: "no-cors",
        headers: {'Content-Type': 'application/json'},
      }
    const type = 'write_jd'
    var url = `http://192.168.1.240:105/amendment?textBody=${encodeURIComponent(jdBody)}&type=${type}&instructions=${amendmentText}`
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => setJDBody(data['response']))
  }


  const onSubmitGenerate = () => {
    // var data = new FormData();
    var payload = {
      'company_name': companyName,
      'company_description': companyDescription,
      'necessary_skills': necessarySkills.split(","),
      "preferred_skills": preferredSkills.split(","),
      "team_name": teamName,
      "team_description": teamDescription,
      "job_title": jobTitle
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
    var url = 'http://192.168.1.240:105/getjd?'
    for (const [key, value] of Object.entries(payload)) {
      url += `${key}=${encodeURIComponent(value)}&`;
    }
    console.log(url)
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => setJDBody(data['response']))
  }

  return (
    <>
      <h1>Let's Start With a JD</h1>
      <p>Provide some details about the role you want to fill:</p>
      <form>
        <label>
          Job Title:<br />
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Company Name:<br />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Company Description:<br />
          <input
            type="text"
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Team Name:<br />
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Team Description:<br />
          <input
            type="text"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Necessary Skills:<br />
          <input
            type="text"
            value={necessarySkills}
            onChange={(e) => setNecessarySkills(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
          Preferred Skills:<br />
          <input
            type="text"
            value={preferredSkills}
            onChange={(e) => setPreferredSkills(e.target.value)}
            style={{'width': 800}}
          /><br /><br />
        </label>
      </form>
      <button onClick={onSubmitGenerate}>Generate Job Description:</button><br /><br />
      <form>
        <label>Make amendment:</label>
        <input
            type="text"
            value={amendmentText}
            onChange={(e) => setAmendmentText(e.target.value)}
          />
      </form>
      <button onClick={onSubmitAmendment}>Ask for amendment</button><br /><br />
      <TextareaAutosize
        name="body"
        onChange={(e) => setJDBody(e.target.value)}
        value={jdBody}
        style={{'width': 800}}
        /><br /><br />
      <Link to="/uploadjd"><button>Submit JD</button></Link>
    </>
  );
};

export default WriteJD;
