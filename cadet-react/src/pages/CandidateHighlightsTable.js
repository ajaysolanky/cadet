import React from 'react';
import { render } from 'react-dom';
import { useEffect, useState } from "react";
import '../../node_modules/uikit/dist/css/uikit.css'

class UserTableRow extends React.Component {
    constructor(props) {
      super(props);

      this.props.onHighlightSelected.bind(this);
    }

    render() {
        const { highlight } = this.props;
        return [
          <tr key="main" onClick={() => {this.props.onHighlightSelected(highlight)}}>
            <td>{highlight.qual}</td>
            <td>{highlight.overview_analysis}</td>
          </tr>,
        ];
      }
}

class CandidateHighlightsTable extends React.Component {  
    constructor(props) {
        super(props);

        this.props.onHighlightSelected.bind(this)
    }
  
    render() {
      const { highlights } = this.props.highlights;
      const isLoading = highlights === null;
      return (
        <main>
          <div className="table-container">
            <div className="uk-overflow-auto">
              <table className="uk-table uk-table-hover uk-table-middle uk-table-divider">
                <tbody>
                  {isLoading
                    ? <tr><td colSpan={6} className="uk-text-center"><em className="uk-text-muted">Loading...</em></td></tr>
                    : this.props.highlights.map((highlight, index) =>
                        <UserTableRow key={index} index={index + 1} highlight={highlight} onHighlightSelected={this.props.onHighlightSelected}/>
                      )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </main>
      );
    }
  }

  export default CandidateHighlightsTable;