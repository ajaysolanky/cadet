import { Link } from "react-router-dom";

const Home = () => {
    return (
      <>
        <h1>welcome to CADET</h1>
        <p>Cadet lets you harness generative AI to speed up your recruiting cycle</p>
        <p>Features:</p>
        <p>1. JD Writing Assistant</p>
        <p>2. Resume Screening Assistant</p>
        <p>3. Candidate Outreach Assistant</p>
        <p>4. Candidate Reply Assistant</p>
        <Link to="/writejd"><button>Get Started</button></Link>
      </>);
  };
  
  export default Home;
  