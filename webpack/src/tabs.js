import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute, Link } from 'react-router';
import { SearchBar, SegmentedControl, WingBlank, Picker, Icon, PullToRefresh, ListView, Button, Toast, ActivityIndicator,Flex,Tabs,TabBar } from 'antd-mobile';
import { createForm } from 'rc-form';
import reqwest from 'reqwest';
import Listview from './listview.js';


function renderTabBar(props) {
  return (<Sticky>
    {({ style }) => <div style={{ ...style, zIndex: 1 }}><Tabs.DefaultTabBar {...props} page={5} /></div>}
  </Sticky>);
}

class Index extends React.Component {
  constructor(props){
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      categoryList:[],
      category_id:0
    };
  }

  componentWillMount() {
      this.fetchCategory();

      var key_storage = 'u_tab_history';

      var cache = localStorage.getItem(key_storage) || '{}';
      var nowCache = JSON.parse(cache);
      if (nowCache.time != undefined && (new Date().getTime() - nowCache.time) < (1000 * 60 * 5)){
          this.setState({category_id: nowCache.category_id});
          localStorage.setItem('u_tab_history', JSON.stringify({category_id: nowCache.category_id, time: new Date().getTime()}));
      }else{
          localStorage.setItem('u_tab_history', JSON.stringify({category_id: this.state.category_id, time: new Date().getTime()}));
      }
  }
  componentDidMount() {
      
  }
  

  fetchCategory =(params) =>{
    
    reqwest({
      url: '/api/articles/getcategorylist',
      method: 'post',
      data: {
      },
      type: 'json',
    }).then((result) => {
        var r = result.Data;
        if(r.status == 0){
          if(r.data.list&&r.data.list.length>0){
            this.setState({categoryList:r.data.list,category_id: r.data.list[0].category_id});
          }
        }else{
          Toast.fail(r.msg, 1);
        }
        }).fail((err, msg) => {
          Toast.fail('网络错误');    
        }).always((e) =>{
        });
  }

  handleTab =(tab) =>{

    let cacheTab = this.state.cacheTab;
    let existCache = cacheTab.filter(p=>{return p.category_id == this.state.category_id});
    let nowCache = cacheTab.filter(p=>{return p.category_id == tab.category_id});

    if (existCache.length == 0){
        cacheTab.push({category_id:this.state.category_id, pageIndex: pageIndex, rData:this.rData});
        this.setState({cacheTab});
    }else{
	    existCache[0].pageIndex = pageIndex;
        existCache[0].rData = this.rData;
        this.setState({ cacheTab});
    }

    if (nowCache.length > 0){
        pageIndex = nowCache[0].pageIndex;
        this.rData=nowCache[0].rData;
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.rData)});
    }else{
	    pageIndex = 0;
        this.rData=[];
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.rData),adsList:[]});
        let params ={
          limit:6,
          more:0,
          category_id:tab.category_id
        }
        this.fetch(params);
    }
  }
  
  render() {

    let categoryList = this.state.categoryList;

    let tabs = [];

    categoryList.forEach(p=>{
        tabs.push({ title: p.category_name,category_id: p.category_id });
    });

    
    return (

        <Tabs tabs={tabs} initialPage={this.state.category_id} onChange={(tab,index)=>{
                      //.handleTab(tab);
                      this.setState({category_id: tab.category_id});
                      localStorage.setItem('u_tab_history', JSON.stringify({category_id: tab.category_id, time: new Date().getTime()}));
                    }} renderTabBar={props => <Tabs.DefaultTabBar {...props} page={6} />}>
              {
                this.state.categoryList.map(p=>{
                    return <Listview category_id={p.category_id} categoryIndex={this.state.category_id} />   
                })
              }
        </Tabs>
    );
  }
}

export default Index;