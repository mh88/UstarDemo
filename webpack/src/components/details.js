import React from 'react';
import { hashHistory } from 'react-router';
import ReactQMap from 'react-qmap';
import { WingBlank, Icon, ActivityIndicator, Toast,WhiteSpace,NavBar,Card,List } from 'antd-mobile';
import reqwest from 'reqwest';

const Item = List.Item;
const Brief = Item.Brief;

function closest(el, selector) {
  const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

class details extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: {},
      isLoading:false,
    };
  }
  componentDidMount() {
    document.body.style.overflow = 'auto';
    document.getElementsByTagName('body')[0].style.height = 'auto';
    const code = this.props.location.query && this.props.location.query.code;
    const categoryid = this.props.location.query && this.props.location.query.categoryid;
    const articles_id = this.props.location.query && this.props.location.query.articles_id;

    this.fetch(code,articles_id,categoryid);
    
	};

  componentWillUnmount() {
    document.body.style.overflow = '';
    document.getElementsByTagName('body')[0].style.height = '100%';
  }
  fetch =(params,articles_id, categoryid) =>{
    this.setState({
      isLoading: true,
    });
    
    reqwest({
      url: '/api/Articles/get',
      method: 'get',
      data: {
          //sJsonModel: JSON.stringify({code: params,articles_id: articles_id, category_id:categoryid}),
          code: params,
          articles_id: articles_id, 
          category_id:categoryid
      },
      type: 'json',
    }).then((result) => {
        var r = result.Data;
        if(r.status == 0){

            this.setState({data:r.data});
            document.title = r.data.title;
        }else{
          Toast.fail(r.msg, 1);
        }
    }).fail((err, msg) => {
      Toast.fail('网络错误');    
    }).always((e) =>{
      this.setState({
        isLoading: false,
      });
    });
}
  goToHome = () =>{
    
    if(window.history.length>1){
        window.history.back();
    }else{
      window.location.href = '/';
    }
    
  }

  goToTop =() =>{
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

   goToDetails =(code,articles_id,category_id) =>{
       this.goToTop();
    let origin=window.location.protocol + '//' + window.location.host;

   window.location.replace(origin+'/?0#/'+'dt?code='+code+'&categoryid='+ category_id+'&articles_id='+articles_id);
   window.location.reload();
  }
  render() {
 
    let data = this.state.data;

    let link = data.articles_link && JSON.parse(data.articles_link) || [];
    return (
      <div className="content searchContent detailContent">
     
      <ActivityIndicator
                toast
                text="加载中..."
                animating={this.state.isLoading}
              />
      <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={this.goToHome}
          leftContent={'返回'}
          rightContent={[
            <Icon key="0" type="search" style={{ marginRight: '16px' }} />,
            <Icon key="1" type="ellipsis" />,
          ]}
        >{data.category_name}</NavBar>
      <WingBlank size="lg">
        <div className='detail'>
            
            <div className='shopName'>{data.title || ''}</div>
            <div className='author'>
                {data.author || ''}
                <div className='date'>
                    {data.create_time && data.create_time.split('T')[0] || ''}
                </div>
            </div>

            <div className='description' dangerouslySetInnerHTML={{ __html:data.articles_content}}></div>
        </div>
      </WingBlank>

      <WhiteSpace size="lg" />
          
      <WingBlank size="lg">
          <div className="ad_container">
              <div className='ad_img'><img className='bigImg' src='https://tpc.googlesyndication.com/simgad/12130699984030901586?sqp=4sqPyQQ7QjkqNxABHQAAtEIgASgBMAk4A0DwkwlYAWBfcAKAAQGIAQGdAQAAgD-oAQGwAYCt4gS4AV_FAS2ynT4&rs=AOga4qmWe5-GSCzABSkDUs6anKtIDv8ArQ' alt='' /></div> 
              <div className='ad_title'>这里是广告标题</div> 
              <div className='ad_logo'>
                  <div className='ad_logo_left'>点媒</div> 
                  <div className='ad_logo_right'>详情</div>
              </div>
          </div>
      </WingBlank>
      <WhiteSpace size="lg" />

      <WingBlank size="lg">
         <Card>
          <Card.Body>
            <div className='ad_container' onClick={()=>{window.location.href = 'https://engine.easytui.com.cn/activities?appkey=e39977d6493e44adb15b6ece346129f0&adslotid=10023&mediatype=1'}}>
                <img className='bigImg' src='https://tpc.googlesyndication.com/simgad/12130699984030901586?sqp=4sqPyQQ7QjkqNxABHQAAtEIgASgBMAk4A0DwkwlYAWBfcAKAAQGIAQGdAQAAgD-oAQGwAYCt4gS4AV_FAS2ynT4&rs=AOga4qmWe5-GSCzABSkDUs6anKtIDv8ArQ' alt='' /></div>
          </Card.Body>
          <Card.Header
            title="点媒"
            thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            extra={<span>详情</span>}
          />
          
          <Card.Footer content="footer content" extra={<div>extra footer content</div>} />
        </Card>
       </WingBlank>

    <WhiteSpace size="lg" />

      <WingBlank size="lg">
            <List className='link-container'>
                  {link.map(p=>{
                        return   <Item
                                  thumb={ p.cover && p.cover.length> 0 ? p.cover[0]: null}
                                  onClick={() => {this.goToDetails('a',p.id,this.props.location.query.categoryid)}}
                                  arrow="horizontal"
                                >
                                  {p.title}
                                </Item>
                   })}
            </List>
       </WingBlank>
      </div>
    );
  }
}
export default details;


