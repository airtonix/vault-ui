import React, { Component, PropTypes } from 'react';
import {
  Card,
  CardText,
  CardTitle,
  Button,
  Textfield,
  Spinner } from 'react-mdl';
import { connect } from 'react-redux';
import connectData from 'helpers/connectData';
import { isLoaded, load } from 'redux/modules/secrets';

import { isDecryptLoaded, decrypt } from 'redux/modules/secrets';

import {
  CollapsibleSection,
  CollapsibleList } from '../../components';


import superagent from 'superagent';

function fetchData(getState, dispatch) {
  // console.log('fetching secret data');
  const promises = [];
  if (!isLoaded(getState())) {
    // console.log('calling load secret');
    promises.push(dispatch(load()));
  }else {
    // console.log('skpping load secret');
  }
  return Promise.all(promises);
}

function fetchDecryptedData(getState, dispatch) {
  const promises = [];

  if (!isDecryptLoaded(getState())) {
    promises.push(dispatch(decrypt()));
  }

  return Promise.all(promises);
}

function groupOrKey(secret, parent) {
  // console.log(`Analyzing secret: ${secret}`);
  const keys = Object.keys(secret);
  let result = null;

  if (keys.length > 0) {
    // console.log(`Key Length of Secret: ${keys.length}`);
    const moreKeys = keys.map((key) => {
      let display = null;
      // console.log(`Working key ${key}`);
      if (Object.keys(secret[key]).length > 0 ) {
        // console.log( 'Would be group');
        display = (<SecretGroup groupName={key} groupData={secret[key]} parent={parent} id={key} />);
      } else {
        // console.log( 'Would be entry');
        display = (
          <SecretDisplay secretName={key} parent={parent} id={key}/>
        );
      }

      return display;
    });

    result = moreKeys;
  } else {
    // console.log(`No length for ${Object.keys(secret)}`);
  }

  return result;
}

@connectData(fetchDecryptedData)
@connect(
  state => ({
    secrets: state.secrets.data,
    isFetching: state.secrets.isFetching
  }))
class SecretDisplay extends Component {
  static propTypes = {
    secretName: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
  }

  decryptMe = (ev) => {
    ev.preventDefault();
    const me = this;

    const id = `${this.props.parent}/${this.props.secretName}`;

    superagent
    .get('/api/secret')
    .query({ id: id })
    .then((rsp) => {
      me.setState({
        secret: rsp.body
      });
    });
  }

  render() {
    const btnStyle = {
      minWidth: '200px',
      marginBottom: '10px',
      background: '#607D8B',
      color: 'white'
    };
    const styles = require('./Secrets.scss');

    return (
      <div>
        <Button onClick={this.decryptMe} style={btnStyle} raised ripple>{this.props.secretName}</Button>
        {this.state &&
          <div className={styles.secretValue}>
            <pre>{ JSON.stringify(this.state.secret, null, 4) }</pre>
          </div>
        }
      </div>
    );
  }
}

class SecretGroup extends Component {
  static propTypes = {
    groupName: PropTypes.string.isRequired,
    groupData: PropTypes.object,
    parent: PropTypes.string.isRequired
  }

  render() {
    // console.log(`Secret group: ${this.props.groupName} Data: ${Object.keys(this.props.groupData)}`);
    const group = groupOrKey(this.props.groupData, `${this.props.parent}/${this.props.groupName}`);
    return (
      <div>
        <CollapsibleList>
          <CollapsibleSection key={this.props.groupName} title={this.props.groupName}>
            {
              group
            }
          </CollapsibleSection>
        </CollapsibleList>
        </div>
    );
  }
}


@connectData(fetchData)
@connect(
  state => ({
    secrets: state.secrets.data,
    isFetching: state.secrets.isFetching
  }))
export default class Secrets extends Component {
  static propTypes = {
    secrets: React.PropTypes.object,
    isFetching: React.PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      group: this.getRootGroup()
    };
  }

  getRootGroup(filter) {
    let regex = null;

    if (filter) {
      regex = new RegExp(filter, 'ig');
    }

    const filterFn = (grp) => {
      let matches = false;

      if (!filter) {
        matches = true;
      } else {
        if (grp.props.groupName) {
          const subGroup = groupOrKey(grp.props.groupData, `${grp.props.parent}/${grp.props.groupName}`);

          const subMatches = subGroup.filter(filterFn);

          if (subMatches.length > 0) {
            matches = true;
          }
          //
        } else {
          const id = grp.props.id.toUpperCase();
          matches = regex.test(id);
        }
      }

      return matches;
    };

    const rootGroup = groupOrKey(this.props.secrets, '/').sort((aaa, bbb) => {
      let ccc = 0;

      if (aaa.props.groupData && !bbb.props.groupData) {
        ccc = -1;
      }

      if (!aaa.props.groupData && bbb.props.groupData) {
        ccc = 1;
      }

      if (!aaa.props.groupData && !bbb.props.groupData) {
        ccc = 0;
      }

      return ccc;
    }).filter(filterFn);

    const filteredGroups = rootGroup.map((ee) => {
      let grp = ee;

      if (filter && ee.props.groupData) {
        const subGroup = groupOrKey(ee.props.groupData, `${ee.props.parent}/${ee.props.groupName}`).filter(filterFn);
        grp = subGroup;
        console.log(subGroup);
      }

      return grp;
    });

    return filteredGroups;
  }

  search = (ev) => {
    ev.preventDefault();
    const filter = ev.target.value;


    this.setState({
      group: this.getRootGroup(filter)
    });
  }

  refreshSecrets = () => {
    if (!this.props.isFetching) {
      // console.log('Calling refresh secrets');
      load();
    } else {
      // console.log('Currently refreshing');
    }
  }

  render() {
    const styles = require('../../components/styles/CardListStyles.scss');

    if (this.props.secrets !== null) {
      // console.log(Object.keys(this.props.secrets).length);
    }

    return (
        <Card shadow={0} className={styles.fullWidthCard}>
          <CardTitle className={styles.cardTitle}>
            <h2 className="mdl-color-text--white">Secrets</h2>
          </CardTitle>
          <CardText className={styles.cardText}>
            <Textfield
                onChange={this.search}
                label="Search"
                style={{width: '200px'}}
            />

            { this.props.isFetching && <Spinner/>}
            { !this.props.isFetching &&
              this.state.group
            }
          </CardText>
        </Card>
    );
  }
}
