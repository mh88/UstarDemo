import React from 'react';
import { hashHistory } from 'react-router';
import { SearchBar, SegmentedControl, WingBlank, Picker, Icon, PullToRefresh, ListView, Button, Toast, ActivityIndicator,} from 'antd-mobile';
import reqwest from 'reqwest';

let pageIndex = 0;

class searchResult extends React.Component {
  constructor(props){
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      isLoading: false,
      hasMore:true,
      empty:false,
    };
  } 


  componentDidMount() {
       
    pageIndex = 0;
    const params = {
      limit:6,
      more:0,
      keyword:this.props.location.state.value
    }
    this.fetch(params);
  }
  rData=[];
  fetch =(params) =>{
      this.setState({
        isLoading: true,
      });
      
      reqwest({
        url: '/Articles/getlist',
        method: 'get',
        data: {
            sJsonModel:JSON.stringify(params),
            r: `${Date.now()}`
        },
        type: 'json',
      }).then((r) => {

      if(r.status == 0){
        
        if(r.data.list && r.data.list.length>0){
        this.rData = [ ...this.rData, ...r.data.list ];
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.rData),
        });}
         if(r.data.list && r.data.list.length == 6){
          this.setState({hasMore:true});
        }else{
		  this.setState({hasMore:false});
		}
        if(this.rData.length==0){
          this.setState({empty:true})
        }else{
          this.setState({empty:false})
        }
      }else{
        Toast.fail(r.msg, 1);
      }
      }).fail((err, msg) => {
        Toast.fail(msg);    
      }).always((e) =>{
        this.setState({
          isLoading: false,
        });
      });

  }

  onEndReached = (event) => {
    
    if (this.state.isLoading || !this.state.hasMore) {
      return;
    }
    let params ={
      limit:6,
      more:++pageIndex*6,
      keyword:this.props.location.state.value
    }
    this.fetch(params);
  };
  goToDetails =(code) =>{
    // var data = {code:code};
    // var path = {
    //   pathname:'/dt',
    //   query:data,
    // }
    // hashHistory.push(path);
    let origin=window.location.protocol + '//' + window.location.host;
    // window.location.href= origin+'/Home/Mobile/?0#/'+'dt?code='+code;
    window.location.href= origin+'/?0#/'+'dt?code='+code;
  }
  goToHome = () =>{
    hashHistory.push({
      pathname:'/',
      state:'',
    });
  }
  goToTop =() =>{
    this.lv.scrollTo(0, 0);
  }
  render() {
    const searchValue = this.props.location.state.value;
    
    const row = (rowData, sectionID, rowID) => {
      
      const obj = this.rData && this.rData.length>0 && this.rData[rowID];
      
      return (
        <div key={rowID} onClick={()=> this.goToDetails(obj.code)} className='listItem'>
          <div className='listItemTop'>
          {obj.logo!=null ? <img className='bigImg' src={obj.logo} alt='店舗イメージ図' /> : ''}
            <div className='listItemTopRight'>
              <div className='row1'>
              { '-'}
              </div>
              {obj.name!=null ? <div className='name'>{obj.name}</div> : ''}
              {obj.address!=null ? <div className='address'>{obj.address}</div> : ''}
            </div>
          </div>
          {obj.description!=null ? <div className='details'>{obj.description}</div> : ''}
          <i className='iconfont icon-iconfontjiantou3 arrowRight'></i>
        </div>
      );
    };
    return (
      
        <ListView
          ref={el => this.lv = el}
          dataSource={this.state.dataSource}
          renderHeader={()=>(
            <div className="listHeader">
              <div className='header'>
                  <div className='headerTop'> [兰庭 CHANNEL] 登録店舗順次拡充!</div>
                  <div className='city'>天津</div>
              </div>
              <div className="logo"><img src="/webpack/dist/logo.png" alt="U-star"/></div>
              <div className='goback' onClick={this.goToHome}><i className='iconfont icon-fanhui'></i>
              <span style={{marginLeft:8}}>返回</span></div>
              <div className='searchText'> {}<span>{searchValue}</span><span style={{marginLeft:8}}>検索結果</span></div>
              {this.state.empty ? <div style={{padding:'0.24rem 0',textAlign:'center'}}>查询数据为空</div> :''}
            </div>
          )}
          renderFooter={()=>(
            <div className='listFooter'>
              <div className='spinIcon'>
                <ActivityIndicator
                    text="'ローディング..."
                    animating={this.state.isLoading}
                  />
              </div>
              <div className="footer">
                    <div className='backToTop' onClick={this. goToTop}>
                      <div><i className='iconfont icon-jiantou-copy'></i></div>
                      <div className='topText'>TOP</div>
                    </div>
                    <div className='copyright'>Copyright © &nbsp;&nbsp;兰庭 CHANNEL&nbsp;&nbsp;All Rights Reserved</div>
              </div>
            </div>
          )}
          renderRow={row}
          useBodyScroll
          onEndReached={this.onEndReached}
          pageSize={6}
          initialListSize={6}
          onEndReachedThreshold={200}
        />
    );
  }
}

export default searchResult;
