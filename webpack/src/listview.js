import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute, Link } from 'react-router';
import { SearchBar, SegmentedControl, WingBlank,WhiteSpace , Picker, Icon, PullToRefresh, ListView, Button, Toast, ActivityIndicator,Flex,Tabs,TabBar } from 'antd-mobile';
import { createForm } from 'rc-form';
import reqwest from 'reqwest';
import VideoPlayer from './components/videoplayer.js'


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
      dataSource,
      isLoading: false,
      hasMore:true,
      adsList:[],
      categoryList:[],
      empty:false,
      category_id:this.props.category_id,
      cacheList:{},
      refreshing:false,
      scrollTop:0,
      playerList:[],
    };
  }

  pageIndex = 0
  componentWillMount() {
    const params = {
      limit:2,
      more:0
    }
      //this.fetchAds(params);
      //this.fetchCategory();
  }
  componentDidMount() {

    var key_storage = 'u_listview_' + this.state.category_id;

    var cache = localStorage.getItem(key_storage) || '{}';
    var nowCache = JSON.parse(cache);

    if (nowCache.time != undefined && (new Date().getTime() - nowCache.time) < (1000 * 60 * 5)){

        this.pageIndex = nowCache.pageIndex;
        this.rData=nowCache.rData;
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.rData)});

        setTimeout(() => this.lv.scrollTo(0, nowCache.scrollTop), 500);
    }else{
        this.pageIndex = 0;
        const params = {
          limit:6,
          more:0,
          category_id:this.state.category_id
        }
        this.fetch(params);
    }
  }
  componentWillUnmount() {
    var key_storage = 'u_listview_' + this.state.category_id;

    localStorage.setItem(key_storage, JSON.stringify({category_id:this.state.category_id, time: new Date().getTime(), pageIndex: this.pageIndex, rData:this.rData,scrollTop: this.state.scrollTop }));
  }

  componentWillReceiveProps (nextProps) {
      //console.log(this.props,nextProps)
      if (this.props.categoryIndex == 1 && nextProps.categoryIndex != 1){
          this.state.playerList.forEach(player=>{
              if (player && player.hasStarted() && !player.paused()){
                  player.pause();
              }
         });
      }
  }

  rData=[];
  fetch =(params) =>{
      this.setState({
        isLoading: true,
      });
      
      reqwest({
        url: '/api/Articles/getlist',
        method: 'post',
        data: {
            sJsonModel:JSON.stringify(params)
        },
        type: 'json',
      }).then((result) => {
          var r = result.Data;
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
        Toast.fail('网络错误');    
      }).always((e) =>{
        this.setState({
          isLoading: false,refreshing:false
        });
      });

  }

  fetchAds =(params) =>{
    
    reqwest({
      url: '/Articles/ads_getlist',
      method: 'post',
      data: {
          sJsonModel:JSON.stringify(params)
      },
      type: 'json',
    }).then((r) => {

        if(r.status == 0){
          if(r.data.list&&r.data.list.length>0){
            let list  = [...this.state.adsList,...r.data.list]
            this.setState({adsList:list});
          }
        }else{
          Toast.fail(r.msg, 1);
        }
        }).fail((err, msg) => {
          Toast.fail('网络错误');    
        }).always((e) =>{
        });

}
  refreshData =()=>{
      let adparams ={
        limit:2,
          more:++this.pageIndex*2
      }
        //this.fetchAds(adparams);

        let params = {};
        params ={
            limit:6,
            more:this.pageIndex*6,
            category_id:this.state.category_id
        }
        this.fetch(params);
  }
  onRefresh = () => {
      this.setState({ refreshing: true, isLoading: true });

      var key_storage = 'u_listview_' + this.state.category_id;
      localStorage.removeItem(key_storage);

      setTimeout(() => {
          this.pageIndex = -1;
          this.rData=[];
          this.setState({ dataSource: this.state.dataSource.cloneWithRows(this.rData),adsList:[]});
          this.refreshData();
      }, 600);
  }
  onEndReached = (event) => {
    console.log('onEndReached');
    
    if (this.state.isLoading || !this.state.hasMore) {
      return;
    }
    
    this.refreshData();
  };
  goToDetails =(code,articles_id,category_id) =>{
    // var data = {code:code};
    // var path = {
    //   pathname:'/dt',
    //   query:data,
    // }
    // hashHistory.push(path);

    var key_storage = 'u_listview_' + this.state.category_id;

    localStorage.setItem(key_storage, JSON.stringify({category_id:this.state.category_id, time: new Date().getTime(), pageIndex: this.pageIndex, rData:this.rData,scrollTop: this.state.scrollTop }));

    let origin=window.location.protocol + '//' + window.location.host;

    window.location.href= origin+'/?0#/'+'dt?code='+code+'&categoryid='+ category_id+'&articles_id='+articles_id;
  }
  goToTop =() =>{
    this.lv.scrollTo(0, 0);
  }
  
  render() {
    const { getFieldProps } = this.props.form;
    const adsList = this.state.adsList;
    let categoryList = this.state.categoryList;

    let tabs = [];

    categoryList.forEach(p=>{
        tabs.push({ title: p.category_name,category_id: p.category_id });
    });

    const row = (rowData, sectionID, rowID, highlightRow) => {
        const obj = this.rData && this.rData.length>0 && this.rData[rowID];
	 
        let adindex = parseInt(rowID/3);
     
        let cover = JSON.parse(obj.cover);

        const PlaceHolder = ({ className = '', ...restProps }) => (
          <div className={`${className} placeholder`} {...restProps}>Block</div>
        );

        let list_class = (obj.recommend && rowID==0) ? 'listItem listItemRecoment' : (cover.length == 1 && obj.url && obj.url.length > 0 ? 'listItemVideo' : 'listItem');
        let is_video = cover.length == 1 && obj.url && obj.url.length > 0;

        let videoJsOptions = {
          autoplay: false,
          controls: true, 
          poster:cover[0],
          width: 350,
          height: 200,
          sources: [{
              //src: 'http://172.16.7.174:9002/webpack/dist/response4.mp4',
            src: obj.url,
            type: 'video/mp4'
          }]
        };

          return (
            <div key={rowID} className={list_class}>
              <div className='mainContent' onClick={()=> { if (!is_video){this.goToDetails(obj.code,obj.articles_id,obj.category_id)}}}>
                { is_video ?
                  <div className="flex-container listItemTopRight">
                    <div>
                        <Flex justify="center">
                        { 
                            <div><VideoPlayer { ...videoJsOptions } scrollTop={this.state.scrollTop} rowID={parseInt(rowID)} playerlist={this.state.playerList} playerListCallback={(player)=>{let playerList = this.state.playerList; playerList.push(player);this.setState({playerList})}} /></div>
                            //cover.map(p=>{
                            //    return <div><img className='bigImg' src={p} alt='' /><span className='video-play'></span></div> 
                            //})
                        }
                        </Flex>
                    </div>
                    <div className='row1'>
                        {obj.title}
                    </div>
                    <div>
                            {obj.author!=null ? <div className='name'>{obj.author}</div> : ''}
                     </div>
                 </div>
                :
                 cover.length == 1 ?
                        <div className="flex-container listItemTopRight">
                            <Flex align="start">
                            <div className='row1'>
                                {obj.title}
                                {obj.author!=null ? <div className='name2'>{obj.author}</div> : ''}
                            </div>
                            { cover.map(p=>{
                                    return <div className='inline-right'><img className='bigImg2' src={p} alt='' /></div> 
                                })
                            }
                            </Flex>
                    </div>
                :
                <div className="flex-container listItemTopRight">
                    <div className='row1'>
                        {obj.title}
                    </div>
                    <div>
                        <Flex>
                        { cover.map(p=>{
                                return <div className='inline'><img className='bigImg' src={p} alt='' /></div> 
                            })
                        }
                        </Flex>
                    </div>
                    <div>
                            {obj.author!=null ? <div className='name'>{obj.author}</div> : ''}
                    </div>
                </div>
              }
              </div>

              {((rowID+1)%3==0) && adsList.length>0 && adsList[adindex] ? <div className='ad'><a href={adsList[adindex].landing_page ? adsList[adindex].landing_page : ''}><img src={adsList[adindex].img_url ? adsList[adindex].img_url :''} /></a></div> : ''}

            </div>
          );
    };
    return (
        
        <ListView
              ref={el => this.lv = el}
              dataSource={this.state.dataSource}
              renderHeader={null}
              renderFooter={()=>(
                <div className='listFooter'>
                  <div className='spinIcon'>
                    <ActivityIndicator text="加载中..."
                        animating={this.state.isLoading}
                      />
                  </div>
                  <div className="footer">
                        <div className='backToTop0' onClick={this.goToTop}>
                          <div><i className='iconfont icon-jiantou-copy'></i></div>
                          <div className='topText'>TOP</div>
                        </div>
                        <div>-------- 我是底线 --------</div>
                  </div>
                </div>
              )}
              renderRow={row}
              onEndReached={this.onEndReached}
              pageSize={6}
              initialListSize={(this.pageIndex + 1) * 6}
              onEndReachedThreshold={300}
              onLayout={(e)=>{consolo.log(e)}}
              onContentSizeChange={(e)=>{consolo.log(e)}}
              onScroll={(e)=>{this.setState({scrollTop: e.target.scrollTop, clientWidth:e.target.clientWidth })}}
              pullToRefresh={<PullToRefresh
                  refreshing={this.state.refreshing}
                  onRefresh={this.onRefresh}
                />}
            />
    );
  }
}

const IndexForm = createForm()(Index);

export default IndexForm;