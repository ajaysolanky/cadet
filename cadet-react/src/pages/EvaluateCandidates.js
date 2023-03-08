import { useState } from "react";
import { Link } from "react-router-dom";
import Collapsible from 'react-collapsible';
import { useSelector, useDispatch } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';

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
        {/* <Collapsible trigger="Test">
            <p>whatever</p>
        </Collapsible> */}
        <ul>
            {quals.split(",").map((el) => {
                return (
                    <li>{el}</li>
                )
            })}
        </ul><br />
        <table>
            <thead>
                <tr>
                    <th className="uk-table-shrink" />
                    <th className="uk-table-shrink" />
                    <th>Candidate Name</th>
                    <th>Candidate Email</th>
                    <th>Candidate Resume</th>
                    <th>Candidate Qualifications</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map((val, key) => {
                    return (
                        <tr key={key}>
                            <td><input type="radio" name={val.name} /></td>
                            <td>{key+1}.</td>
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
            </tbody>
        </table><br />
        <button onClick={handleButtonClick}>Review Resumes</button><br /><br />
        <Link to="/requestinterview"><button>Request Interview</button></Link>
      </>);
  };
  
  class UserTableRow extends React.Component {
    state = { expanded: false }
  
    toggleExpander = (e) => {
      if (e.target.type === 'checkbox') return;
  
      if (!this.state.expanded) {
        this.setState(
          { expanded: true },
          () => {
            if (this.refs.expanderBody) {
                console.log()
            //   slideDown(this.refs.expanderBody);
            }
          }
        );
      } else {
        console.log()
        // slideUp(this.refs.expanderBody, {
        //   onComplete: () => { this.setState({ expanded: false }); }
        // });
      }
    }
  
    render() {
      const { user } = this.props;
      return [
        <tr key="main" onClick={this.toggleExpander}>
          <td><input className="uk-checkbox" type="checkbox" /></td>
          <td className="uk-text-nowrap">{this.props.index}.</td>
          <td><img className="uk-preserve-width uk-border-circle" src={user.picture.thumbnail} width={48} alt="avatar" /></td>
          <td>{capitalize(user.name.first + ' ' + user.name.last)}<br /><small>{user.email}</small></td>
          <td>{capitalize(user.location.city)} ({user.nat})</td>
          <td>{formatDate(user.registered)}</td>
        </tr>,
        this.state.expanded && (
          <tr className="expandable" key="tr-expander">
            <td className="uk-background-muted" colSpan={6}>
              <div ref="expanderBody" className="inner uk-grid">
                <div className="uk-width-1-4 uk-text-center">
                  <img className="uk-preserve-width uk-border-circle" src={user.picture.large} alt="avatar" />
                </div>
                <div className="uk-width-3-4">
                  <h3>{capitalize(user.name.first + ' ' + user.name.last)}</h3>
                  <p>
                    Address:<br/>
                    <i>
                      {capitalize(user.location.street)}<br/>
                      {user.location.postcode} {capitalize(user.location.city)}<br/>
                      {user.nat}
                    </i>
                  </p>
                  <p>
                    E-mail: {user.email}<br/>
                    Phone: {user.phone}
                  </p>
                  <p>Date of birth: {formatDate(user.dob)}</p>
                </div>
              </div>
            </td>
          </tr>
        )
      ];
    }
  }

  function formatDate(str) {
    return str.substr(0, 10);
  }
  
  function capitalize(str) {
    return str.split(' ').map(s => {
      return s.charAt(0).toUpperCase() + s.substr(1);
    }).join(' ');
  }

  export default EvaluateCandidates;
  