import React from 'react';

export default class VideoPlayer extends React.Component {
  state = {
      player:null
  }

  componentDidMount() {
    // instantiate video.js
    let player = videojs(this.videoNode, this.props, function onPlayerReady() {
      //console.log('onPlayerReady', this)
    });
    player.offsetHide = (player.currentHeight() + 80) * (this.props.rowID+1);
    this.player = player;
    this.props.playerListCallback(player);
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      let $this = this;
      setTimeout(function(){$this.player.dispose()},1000);
    }
  }
  componentWillReceiveProps (nextProps) {

      nextProps.playerlist.forEach(player=>{
          if (player && player.hasStarted() && !player.paused()){
              if (nextProps.scrollTop > player.offsetHide || nextProps.scrollTop < (player.offsetHide - (player.currentHeight() + 80) * 2)){
                  player.pause();
              }
          }
      });
  }
  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div data-vjs-player>
        <video ref={ node => this.videoNode = node } className="video-js"></video>
      </div>
    )
  }
}