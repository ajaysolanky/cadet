import React from 'react';
import { render } from 'react-dom';
import { useEffect, useState } from "react";
import '../../node_modules/uikit/dist/css/uikit.css'

function capitalize(str) {
    return str.split(' ').map(s => {
      return s.charAt(0).toUpperCase() + s.substr(1);
    }).join(' ');
  }

  class UserTableRow extends React.Component {
    constructor(props) {
      super(props);

      this.props.onUserSelected.bind(this);
    }

    state = { expanded: false }
  
    // toggleExpander = (e) => {
    //   if (e.target.type === 'checkbox') return;
  
    //   if (!this.state.expanded) {
    //     this.setState(
    //       { expanded: true },
    //       () => {
    //         if (this.refs.expanderBody) {
    //           slideDown(this.refs.expanderBody);
    //         }
    //       }
    //     );
    //   } else {
    //     slideUp(this.refs.expanderBody, {
    //       onComplete: () => { this.setState({ expanded: false }); }
    //     });
    //   }
    // }

    render() {
        const { user } = this.props;
        return [
          <tr key="main" onClick={() => {this.props.onUserSelected(user)}}>
            <td><input className="uk-checkbox" type="checkbox" /></td>
            <td><img className="uk-preserve-width uk-border-circle" src={user.thumbnail} width={48} alt="avatar" /></td>
            <td>{capitalize(user.name)}<br /><small>{user.email}</small></td>
            <td>{capitalize(user.city)}</td>
          </tr>,
        ];
      }
}

class CandidateTable extends React.Component {  
    constructor(props) {
        super(props);

        this.props.onUserSelected.bind(this)
    }
  
    render() {
      const { users } = this.props.users;
      const isLoading = users === null;
      return (
        <main>
          <div className="table-container">
            <div className="uk-overflow-auto">
              <table className="uk-table uk-table-hover uk-table-middle uk-table-divider">
                <thead>
                  <tr>
                    <th className="uk-table-shrink" />
                    <th className="uk-table-shrink">Avatar</th>
                    <th>Fullname</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? <tr><td colSpan={6} className="uk-text-center"><em className="uk-text-muted">Loading...</em></td></tr>
                    : this.props.users.map((user, index) =>
                        // <button onClick={this.onUserSelected(user)}> Click me </button>
                        <UserTableRow key={index} index={index + 1} user={user} onUserSelected={this.props.onUserSelected}/>
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

  export default CandidateTable;