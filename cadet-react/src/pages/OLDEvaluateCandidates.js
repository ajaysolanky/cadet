import { useState } from "react";
import { Link } from "react-router-dom";
import Collapsible from 'react-collapsible';
import { useSelector, useDispatch } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';
import {
    PdfLoader,
    PdfHighlighter,
    Tip,
    Highlight,
    Popup,
    AreaHighlight,
  } from "react-pdf-highlighter";
import { slideDown, slideUp } from '../anim';
import { testHighlights } from "./test-highlights";

// import '../../node_modules/uikit/dist/css/uikit.css'
// import '../css/eval_table.css'

const EvaluateCandidates = () => {
    const quals = useSelector((state) => state.job.quals);

    const [candidates, setCandidates] = useState([
        {"name": "Ajay Solanky", "email": "ajsolanky@gmail.com", "resume": <a href="/resources/ajay_resume.pdf">Ajay's Resume</a>},
        {"name": "Aalhad Patankar", "email": "aalhad.patankar@gmail.com", "resume": <a href="/resources/aal_resume.pdf">Aal's Resume</a>},
        {"name": "Yamini Bhandari", "email": "yamini.bhandari@gmail.com", "resume": <a href="/resources/yb_resume.pdf">Yamini's Resume</a>}
    ])
    const handleButtonClick = () => {
        console.log('clicked!!')
        const newTableDataPromises = [];
        candidates.forEach(element => {
            var url = `http://127.0.0.1:105/evalcandidate?name=${encodeURIComponent(element.name)}&quals=${encodeURIComponent(quals)}`
            newTableDataPromises.push(
                fetch(url, {
                    "method": "GET",
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(response => {
                        var j = response.json()
                        console.log(j)
                        return j
                    })
                    .then(data => ({"evaledQuals": data["response"], ...element}))
            )
        })
        Promise.all(newTableDataPromises).then(newTableData => setCandidates(newTableData))
    }
    console.log(candidates)

    return (
      <>
        <h1>Candidate Applications</h1>
        <p>Seeking the following qualifications:</p>
        <ul>
            {quals.split(",").map((el, idx) => {
                return (
                    <li key={idx}>{el}</li>
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
                {candidates.map((candidate, index) =>
                    <CandidateTableRow key={index} index={index+1} candidate={candidate} />
                )}
            </tbody>
        </table><br />
        <button onClick={handleButtonClick}>Review Resumes</button><br /><br />
        <Link to="/requestinterview"><button>Request Interview</button></Link>
      </>);
  };
  
  class CandidateTableRow extends React.Component {
    state = { expanded: false }

    componentDidUpdate() {
      console.log('divElement?')
      console.log(this.divElement?.clientHeight)
    //   console.log(this.divElementOther?.clientHeight)
    }

    scrollViewerTo = (highlight) => {};

    scrollToHighlightFromHash = () => {
        const highlight = this.getHighlightById(parseIdFromHash());
    
        if (highlight) {
          this.scrollViewerTo(highlight);
        }
      };

      addHighlight(highlight) {
        const { highlights } = this.state;
    
        console.log("Saving highlight", highlight);
    
        this.setState({
          highlights: [{ ...highlight, id: getNextId() }, ...highlights],
        });
      }
  
    toggleExpander = (e) => {
      if (e.target.type === 'checkbox') return;
  
      if (!this.state.expanded) {
        this.setState(
          { expanded: true },
          () => {
            if (this.divElement) {
              slideDown(this.divElement);
            }
          }
        );
      } else {
        slideUp(this.divElement, {
          onComplete: () => { this.setState({ expanded: false }); }
        });
      }
    }
  
    render() {
      const highlights = testHighlights;
      const { candidate } = this.props;
      return [
        <tr key="main" onClick={this.toggleExpander}>
          <td><input className="uk-checkbox" type="checkbox" /></td>
          <td className="uk-text-nowrap">{this.props.index}.</td>
          <td>{candidate.name}</td>
          <td>{candidate.email}</td>
          <td>{candidate.resume}</td>
          <td><ul>{(candidate.evaledQuals || '').split("*").slice(1).map((el) => {
                                return (<li>{el}</li>)
                            })}</ul></td>
        </tr>,
        this.state.expanded && (
          <tr className="expandable" key="tr-expander">
            <td className="uk-background-muted" colSpan={6}>
              <div ref={ (divElement) => {this.divElement = divElement} } className="inner uk-grid" style={{'height': 1000}}>
                <PdfLoader ref={ (element) => {this.pdfLoaderRef = element} } url={"https://arxiv.org/pdf/1708.08021.pdf"}>
                    {(pdfDocument) => (
                        <PdfHighlighter
                            pdfDocument={pdfDocument}
                            enableAreaSelection={(event) => event.altKey}
                            onScrollChange={resetHash}
                            scrollRef={(scrollTo) => {
                                this.scrollViewerTo = scrollTo;
                                this.scrollToHighlightFromHash();
                            }}
                            onSelectionFinished={(
                                position,
                                content,
                                hideTipAndSelection,
                                transformSelection
                              ) => (
                                <Tip
                                  onOpen={transformSelection}
                                  onConfirm={(comment) => {
                                    this.addHighlight({ content, position, comment });
              
                                    hideTipAndSelection();
                                  }}
                                />
                              )}
                              highlightTransform={(
                                highlight,
                                index,
                                setTip,
                                hideTip,
                                viewportToScaled,
                                screenshot,
                                isScrolledTo
                              ) => {
                                const isTextHighlight = !Boolean(
                                  highlight.content && highlight.content.image
                                );
              
                                const component = isTextHighlight ? (
                                  <Highlight
                                    isScrolledTo={isScrolledTo}
                                    position={highlight.position}
                                    comment={highlight.comment}
                                  />
                                ) : (
                                  <AreaHighlight
                                    isScrolledTo={isScrolledTo}
                                    highlight={highlight}
                                    onChange={(boundingRect) => {
                                      this.updateHighlight(
                                        highlight.id,
                                        { boundingRect: viewportToScaled(boundingRect) },
                                        { image: screenshot(boundingRect) }
                                      );
                                    }}
                                  />
                                );
              
                                return (
                                  <Popup
                                    popupContent={<HighlightPopup {...highlight} />}
                                    onMouseOver={(popupContent) =>
                                      setTip(highlight, (highlight) => popupContent)
                                    }
                                    onMouseOut={hideTip}
                                    key={index}
                                    children={component}
                                  />
                                );
                              }}
                              highlights={highlights}
                        />
                    )}
                </PdfLoader>
                {/* <div className="uk-width-1-4 uk-text-center">
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
                </div> */}
              </div>
            </td>
          </tr>
        )
      ];
    }
  }

  const parseIdFromHash = () =>
    document.location.hash.slice("#highlight-".length);

  const resetHash = () => {
    document.location.hash = "";
  };

  function formatDate(str) {
    return str.substr(0, 10);
  }
  
  function capitalize(str) {
    return str.split(' ').map(s => {
      return s.charAt(0).toUpperCase() + s.substr(1);
    }).join(' ');
  }

  const getNextId = () => String(Math.random()).slice(2);

  const HighlightPopup = ({
    comment,
  }) =>
    comment.text ? (
      <div className="Highlight__popup">
        {comment.emoji} {comment.text}
      </div>
    ) : null;
  
    
  export default EvaluateCandidates;
  