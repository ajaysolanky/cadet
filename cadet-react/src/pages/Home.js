import { Link } from "react-router-dom";

const Home = () => {
    return (
      <>
        <h1>welcome to CADET</h1>
        <p>Cadet lets you harness generative AI to speed up your recruiting cycle</p>
        <Link to="/writejd"><button>Get Started</button></Link>
      </>);
  };
  
  export default Home;
  