import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

const EvaluateCandidates = () => {
    const quals = useSelector((state) => state.job.quals);

    const [tableData, setTableData] = useState([
        {"name": "Ajay Solanky", "email": "ajsolanky@gmail.com", "resume": <a href="/resources/ajay_resume.pdf">Ajay's Resume</a>},
        {"name": "Aalhad Patankar", "email": "aalhad.patankar@gmail.com", "resume": <a href="/resources/aal_resume.pdf">Aal's Resume</a>},
        {"name": "Yamini Bhandari", "email": "yamini.bhandari@gmail.com", "resume": <a href="/resources/yb_resume.pdf">Yamini's Resume</a>}
    ])
    const handleButtonClick = () => {
        const newTableDataPromises = [];
        tableData.forEach(element => {
            var url = `http://192.168.1.240:105/evalcandidate?name=${encodeURIComponent(element.name)}&quals=${encodeURIComponent(quals)}`
            newTableDataPromises.push(
                fetch(url, {
                    "method": "GET",
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(response => response.json())
                    .then(data => ({"evaledQuals": data["response"], ...element}))
            )
        })
        Promise.all(newTableDataPromises).then(newTableData => setTableData(newTableData))
    }
    console.log(tableData)
    return (
      <>
        <h1>Candidate Applications</h1>
        <p>Seeking the following qualifications:</p>
        <ul>
            {quals.split(",").map((el) => {
                return (
                    <li>{el}</li>
                )
            })}
        </ul><br />
        <table>
            <tr>
                <th>Select Candidate</th>
                <th>Candidate Name</th>
                <th>Candidate Email</th>
                <th>Candidate Resume</th>
                <th>Candidate Qualifications</th>
            </tr>
            {tableData.map((val, key) => {
                return (
                    <tr key={key}>
                        <td><input type="radio" name={val.name} /></td>
                        <td>{val.name}</td>
                        <td>{val.email}</td>
                        <td>{val.resume}</td>
                        {/* <td>{val.evaledQuals}</td> */}
                        <td><ul>{(val.evaledQuals || '').split("*").slice(1).map((el) => {
                            return (<li>{el}</li>)
                        })}</ul></td>
                    </tr>
                )
            })}
        </table><br />
        <button onClick={handleButtonClick}>Review Resumes</button><br /><br />
        <Link to="/requestinterview"><button>Request Interview</button></Link>
      </>);
  };
  
  export default EvaluateCandidates;
  