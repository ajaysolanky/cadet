import { Link } from "react-router-dom";
import { Circles } from 'react-loader-spinner'
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

const UploadJD = () => {
    const quals = useSelector((state) => state.job.quals);
    const [loader, setLoader] = useState(<Circles
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        />);

    useEffect(() => {
        setTimeout(()=>setLoader(<p>Job upload finished. Candidates retrieved.</p>),3000)
    })

    return (
      <>
        <h1>Uploading JD to LinkedIn</h1>
        {loader}
        <br />
        <Link to="/evalcandidates"><button>Evaluate Candidates</button></Link>
      </>);
  };
  
  export default UploadJD;
  