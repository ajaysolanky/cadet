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
            var url = `http://192.168.1.240:105/evalcandidate?name=${encodeURIComponent(element.name)}&quals=${encodeURIComponent(quals)}`
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
    return (
      <>
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
        {pdfUrl && quals.split(",").map((el, idx) => (<button onClick={() => setSelectedSkill(el)} key={idx}>{el}</button>))}
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
      </>);
  };

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
  