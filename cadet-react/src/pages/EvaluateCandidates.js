import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Collapsible from 'react-collapsible';
import { useSelector, useDispatch } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';
import '../../node_modules/uikit/dist/css/uikit.css'
import {
    PdfLoader,
    PdfHighlighter,
    Tip,
    Highlight,
    Popup,
    AreaHighlight,
  } from "react-pdf-highlighter";

// import { element } from "prop-types";
// import SlidingPanel from 'react-sliding-side-panel';
import CandidateTable from "./CandidateTable";
import CandidateHighlightsTable from "./CandidateHighlightsTable";

const EvaluateCandidates = () => {
    const quals = useSelector((state) => state.job.quals);

    const [pdfUrl, setPdfUrl] = useState();

    const [showResumeOverview, setShowResumeOverview] = useState(false)
    const [hoveredCandidateIndex, setHoveredCandidateIndex] = useState(-1)
    const [hoveredSkillIndex, setHoveredSkillIndex] = useState(-1)
    // TODO: This should probably be an optional or an enum to make this async loadable
    const [tableData, setTableData] = useState([
        {"id": "1", "name": "Ajay Solanky", "email": "ajsolanky@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/ajay_resume.pdf", "city": "New York", "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"},
        {"id": "2", "name": "Aalhad Patankar", "email": "aalhad.patankar@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/aal_resume.pdf", "city": "New York", "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"},
        {"id": "3", "name": "Yamini Bhandari", "email": "yamini.bhandari@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/yb_resume.pdf", "city": "Boston", "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"}
    ])

    const updateAnalysisData = (analysisData) => {
        console.log("Received overivew analysis", analysisData)
        var newTableData = []
        analysisData.forEach((val, idx) => {
            var evaledQuals = []
            quals.split(",").forEach((el, idx) => {
                evaledQuals.push({
                    "qual": el,
                    "overview_analysis": val["overview_analysis"][el.toLowerCase()]
                })
            })
            newTableData.push({
                "evaledQuals": evaledQuals,
                "highlights": val["highlights"],
                ...tableData[idx]
            })
        })
        setShowResumeOverview(true)
        setTableData(newTableData)
    }

    const handleSelectedSkill = (skill) => {
        console.log("Here baby doll")
        setSelectedSkill(skill)
    }
    const handleResumeShowButtonClick = (idx) => {
        const candidate = tableData[idx]
        handleResumeReviewButtonClick()
        setSelectedCandidateIndex(idx);
        setPdfUrl(candidate.resume);
    }

    const handleResumeReviewButtonClick = () => {
        const analysisPromises = [];
        tableData.forEach(element => {
            var url = `http://127.0.0.1:105/evalcandidate?name=${encodeURIComponent(element.name)}&quals=${encodeURIComponent(quals)}`
            analysisPromises.push(
                fetch(url, {
                    "method": "GET",
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(response => response.json())
                    .then(data => data["response"])
                    // .catch(err => console.log(err))
            )
        })
        Promise.all(analysisPromises).then(analysisData => updateAnalysisData(analysisData))
    }

    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0)
    const [selectedSkill, setSelectedSkill] = useState()
    const skillHighlights = tableData.find(candidate => candidate.id == tableData[selectedCandidateIndex].id)?.highlights?.[selectedSkill]

    console.log('printing')
    console.log(tableData)
    console.log(selectedSkill)
    // console.log(tableData.find(candidate => candidate.name == tableData[selectedCandidateIndex])?.highlights)
    console.log("skill highlights", skillHighlights)
    console.log(selectedCandidateIndex)

    const renderCandidateList2 = (tableData) => {
        const onUserSelected = (user) => {
            console.log("user selected", user)
            const candidateIndex = tableData.findIndex(candidate => candidate.id === user.id)
            if (candidateIndex >= 0) {
                console.log("candidate index", candidateIndex)
                handleResumeShowButtonClick(candidateIndex)
            }
        }
        return (
            <div className="sidebar one" textAlign="center">
                <CandidateTable users={tableData} onUserSelected={(user) => {onUserSelected(user)}}> </CandidateTable>
            </div>
        )
    }
    const renderCandidateList = (tableData) => {
        return (
            <div className="sidebar one" textAlign="center">
            <h1 textAlign="center">Candidates</h1>
            <ul className="customList" onMouseLeave={() => setHoveredCandidateIndex(-1)}>
                {tableData.map((candidate, idx) => {
                    return (
                        <li key={idx} className={hoveredCandidateIndex == idx ? "customListItem selected" : "customListItem unselected"} onClick={()=> handleResumeShowButtonClick(idx)} onMouseOver={() => setHoveredCandidateIndex(idx)}>
                            <div>
                                <strong> {candidate.name} </strong>
                                <p>{candidate.email}</p>
                                <Link to="/requestinterview"><button>Outreach</button></Link>
                                {/* <button onClick={() => handleResumeShowButtonClick(idx)}> Outreach </button> */}
                            </div>
                        </li>
                    )
                })}
            </ul>
            </div>
        )
    }

    const renderCandidateHighlights2 = (candidate) => {
        const onHighlightSelected = (highlight) => {
            // const highlightIndex = selectfindIndex(highlight => highlight == highlight)
            handleSelectedSkill(highlight.qual)
        }
        return (
            <div className="sidebar two" textAlign="center">
                <CandidateHighlightsTable highlights={candidate.evaledQuals} onHighlightSelected={(highlight) => {onHighlightSelected(highlight)}}> </CandidateHighlightsTable>
            </div>
        )
    }

    const renderCandidateHighlights = (candidate) => {
        console.log("selected candidate analysis: ", candidate)
            return (
                <div className="sidebar two show">
                    <h1>Highlights</h1>
                            <ul className="customList" onMouseLeave={() => setHoveredSkillIndex(-1)}>
                                {candidate.evaledQuals.map((el, idx) => {
                                    return (
                                        <li key={idx} className={hoveredSkillIndex == idx ? "customListItem selected": "customListItem unselected"} onClick={()=> handleSelectedSkill(el.qual)} onMouseOver={() => setHoveredSkillIndex(idx)}>
                                            <div>
                                                <strong> {el.qual} </strong>
                                                <p> {el.overview_analysis} </p>
                                            </div>
                                        </li>)
                                    })}
                            </ul>
                </div>
            )
    }
    
    const renderOldCandidateList = (tableData) => {
        return (
            <div>
                <h1>Candidate Applications</h1>
            <p>Seeking the following qualifications:</p>
            {/* <Collapsible trigger="Test">
                <p>whatever</p>
            </Collapsible> */}
            <ul>
                {quals.split(",").map((el, idx) => (<li key={idx}>{el}</li>))}
            </ul><br />
            <button onClick={handleResumeReviewButtonClick}>Review Resumes</button><br /><br />
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
                    {tableData.map((val, idx) => {
                        return (
                            <tr key={idx}>
                                <td><input type="radio" name={val.name} /></td>
                                <td>{idx+1}.</td>
                                <td>{val.name}</td>
                                <td>{val.email}</td>
                                <td><button onClick={()=>{handleResumeShowButtonClick(idx)}}>show</button></td>
                                {/* <td>{val.evaledQuals}</td> */}
                                <td><ul>{val.evaledQuals.map((el) => {
                                    return (<li>{el}</li>)
                                })}</ul></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table><br />
            <br /><br /><br />
            <Link to="/requestinterview"><button>Request Interview</button></Link>
            <br /><br />
            </div>
        )
    }
    const renderPDFHighlighter = (pdfURL, skillHighlights) => {
        return (
            <PdfLoader url={pdfUrl}>
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
                        highlights={skillHighlights}
                    />
                )}
            </PdfLoader>
        )
      }

    return (
      <>
      <div style={{display: "flex", height: "100vh"}}>
        {renderCandidateList2(tableData)}
        {showResumeOverview && renderCandidateHighlights2(tableData[selectedCandidateIndex])}
        {/* {pdfUrl && quals.split(",").map((el, idx) => (<button onClick={() => setSelectedSkill(el)} key={idx}>{el}</button>))} */}
        <div className="spacer"></div>
        <div className="highlightContainer">
            <div>
            {renderPDFHighlighter(pdfUrl, skillHighlights)}
            </div>
        </div>
        </div>
      </>);
  };

  const resetHash = () => {
    document.location.hash = "";
  };

  const HighlightPopup = ({
    comment,
  }) =>
    comment.text ? (
      <div className="Highlight__popup">
        {comment.emoji} {comment.text}
      </div>
    ) : null;
  
  export default EvaluateCandidates;
  