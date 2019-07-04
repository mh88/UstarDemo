import React from 'react';
import { hashHistory } from 'react-router';
import { Icon, } from 'antd-mobile';

// not use `babel-plugin-import`
// import 'antd-mobile/dist/antd-mobile.css';
// import NavBar from 'antd-mobile/lib/nav-bar';
// import 'antd-mobile/lib/nav-bar/style/css';
// import Drawer from 'antd-mobile/lib/drawer';
// import 'antd-mobile/lib/drawer/style/css';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div className="container aolight">
        { this.props && this.props.children }
      </div>
    );
  }
}
