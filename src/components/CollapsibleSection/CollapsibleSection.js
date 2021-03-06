import React, { Component, PropTypes } from 'react';

export class CollapsibleSection extends Component {
  static propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    asyncLoadFn: PropTypes.func,
    children: PropTypes.node
  }

  static defaultProps = {
    open: false
  }


  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      styles: require('./Section.scss')
    };
  }

  getState(open) {
    return open ? `${this.state.styles.section} ${this.state.styles.open}` : this.state.styles.section;
  }

  collapse() {
    this.setState({
      open: false
    });
  }

  handleClick = () => {
    if (this.state.open) {
      this.state.open = false;
      this.setState({
        open: false
      });
    } else {
      if (this.props.asyncLoadFn) {
        this.props.asyncLoadFn();
      }
      this.setState({
        open: true
      });
    }
  }


  render() {
    return (
      <div className={this.state.styles.sectionComponent}>
        <div className={this.getState(this.state.open)}>
          <div className={`${this.state.styles.sectionhead}`} onClick={this.handleClick}>{this.props.title}</div>
          <div className={`${this.state.styles.articlewrap}`}>
            <div className={`${this.state.styles.article}`}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class CollapsibleList extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render() {
    const styles = require('./Section.scss');
    return (
      <ul className={styles.sectionList}>
        {React.Children.map(this.props.children, (child, index) => {
          return ( <li key={index} className={styles.sectionListItem}>{child}</li> );
        })}
      </ul>
    );
  }
}
