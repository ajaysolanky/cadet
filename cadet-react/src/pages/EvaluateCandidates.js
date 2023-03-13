import { useEffect, useState } from "react";
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

import { element } from "prop-types";

const EvaluateCandidates = () => {
    const quals = useSelector((state) => state.job.quals);

    const [pdfUrl, setPdfUrl] = useState();

    const [analysisData, setAnalysisData] = useState()

    useEffect(() => {
        if (analysisData) {
            var newTableData = []
            analysisData.forEach((val, idx) => {
                newTableData.push({
                    "evaledQuals": val["overview_analysis"],
                    "highlights": val["highlights"],
                    ...tableData[idx]
                })
            })
            setTableData(newTableData)
        }
    }, [analysisData])

    const [tableData, setTableData] = useState([
        {"name": "Ajay Solanky", "email": "ajsolanky@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/ajay_resume.pdf"},
        {"name": "Aalhad Patankar", "email": "aalhad.patankar@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/aal_resume.pdf"},
        {"name": "Yamini Bhandari", "email": "yamini.bhandari@gmail.com", "resume": "https://cadet-resumes.s3.amazonaws.com/yb_resume.pdf"}
    ])

    const handleResumeShowButtonClick = (idx) => {
        const candidate = tableData[idx]
        setSelectedCandidate(candidate.name);
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
                    // .then(data => ({"evaledQuals": data["response"], ...element}))
            )
        })
        Promise.all(analysisPromises).then(analysisData => setAnalysisData(analysisData))
    }

    // const highlights = testHighlights["https://arxiv.org/pdf/1708.08021.pdf"];

    // console.log(highlights)

    const [selectedCandidate, setSelectedCandidate] = useState()
    const [selectedSkill, setSelectedSkill] = useState()
    const skillHighlights = tableData.find(candidate => candidate.name == selectedCandidate)?.highlights?.[selectedSkill]

    console.log('printing')
    console.log(tableData)
    console.log(selectedSkill)
    console.log(tableData.find(candidate => candidate.name == selectedCandidate)?.highlights)
    console.log(skillHighlights)

    const renderCandidateList = (tableData) => {
        return (
            <ul style={{display: "block", paddingInlineStart: "40px", marginBlockStart:"1em", marginBlockEnd:"1em", listStyleType: "none"}}>
                {tableData.map((candidate, idx) => {
                    return (
                        <li key={idx} style={{padding: "1rem", cursor: "pointer", transition: "background .14s ease-in", borderBottom: "1px solid rgb(119,119,119)"}}>
                            <div>
                                <strong> {candidate.name} </strong>
                                <p>{candidate.email}</p>
                                <button onClick={() => handleResumeShowButtonClick(idx)}>Show Resume</button>
                            </div>
                        </li>
                    )
                })}
            </ul>
        )
    }

    const renderCandidateHighlights = (candidate) = {

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
                                <td><ul>{(val.evaledQuals || '').split("*").slice(1).map((el) => {
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
      <div style={{width: "50vw", background: "linear-gradient(rgb(249,248,247),rgb(251,250,248) 46px,rgb(251,251,249) 120px,rgb(248,247,245) 35%,rgb(249,248,246))"}}>
            {renderCandidateList(tableData)}
        </div>
        {pdfUrl && quals.split(",").map((el, idx) => (<button onClick={() => setSelectedSkill(el)} key={idx}>{el}</button>))}
        <div className="Highlight_container" style={{height: "100vh", width: "50vw", position: "relative"}}>
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
  