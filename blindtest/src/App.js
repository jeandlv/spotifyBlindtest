import React, { Component } from 'react';
import axios from 'axios';
import Sound from 'react-sound';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { tracksLoaded : false, tracks : [] };
    this.handleTracksChange = this.handleTracksChange.bind(this);
  }

  handleTracksChange(tracksLoaded, tracks) {
    let trackNumber = 0;
    while (trackNumber < tracks.length) {
      if(tracks[trackNumber].audioLink === null) {
        tracks.splice(trackNumber, 1);
      }
      else {
        trackNumber++;
      }
    }
    this.setState({tracksLoaded : tracksLoaded, tracks : tracks})
  }

  render() {
    const tracksLoaded = this.state.tracksLoaded;
    const tracks = this.state.tracks;

    if(!tracksLoaded) {
      return (
        <div className="App">
          <h1>Welcome to the Spotify Blindtest</h1>
          <TracksLoader 
            tracksLoaded={tracksLoaded} 
            tracks={tracks}
            onTracksLoaded={this.handleTracksChange}/>
        </div>
      );
    } else {
      if(tracks.length === 0 || tracks === undefined) {
        return(
          <div>
            <h1>Welcome to the Spotify Blindtest</h1>
            <h2>Unvalid API KEY</h2>
          </div>
        );
      }
      return (
        <div className="App">
          <h1>Welcome to the Spotify Blindtest</h1>
          {/*<TrackTable tracks={tracks}/>*/}
          <BlindtestGame tracks={tracks}/>
        </div>
      );
    }
  }
}

class TracksLoader extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      apikey : ''
    }
  }

  handleChange(e) {
    this.setState({apikey : e.target.value})
  }

  handleSubmit(event) {
    let here = this
    if (this.state.apikey === '' || this.state.apikey === undefined || this.state.apikey === null) {
      alert('You have to put a Spotify API KEY')
      return
    }
    //request AJAX to get the datas
    let loadedtracks
    axios({
      method:'get',
      url:' https://api.spotify.com/v1/me/tracks?limit=50',
      headers: {
        "Accept" : "application/json",
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + this.state.apikey
      },
      transformResponse: [(data) => extractTracksDatas(data)]
    })
    .then(function(response) {
      loadedtracks = response.data
      here.props.onTracksLoaded(true, loadedtracks)
    });
    event.preventDefault();
  }

  render() {
    const tracksLoaded = this.props.tracksLoaded;
    const tracks = this.props.tracks;

    if (tracksLoaded) {
      return(<h1>Hey</h1>);
    }
    else {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            API KEY :
            <input 
              type="text" 
              value={this.state.apikey}
              onChange={this.handleChange}
              />
          </label>
          <input type="submit" value="Submit"/>
        </form>
      );
    }
  }
}

class BlindtestGame extends React.Component {
  constructor(props) {
    super(props);
    this.hasAnswered = this.hasAnswered.bind(this);
    this.state = { 
      tracks : this.props.tracks,
      score : 0,
      round : 1
    };

  }

  hasAnswered(correctAnswer) {
    if(correctAnswer) {
      this.setState({score : this.state.score + 10});
    }
    else {
      this.setState({score : this.state.score});
    }
    this.state.round++;
  }

  render() {
    let blindtestBody;

    // replace by the number of rounds
    if(this.state.round < 6) {
      let possibleTracks = []
      let rightTrack = this.state.tracks.splice(Math.floor(Math.random()*this.state.tracks.length), 1)[0];
      possibleTracks = [[rightTrack, true]];
      for(let i = 1; i < 5; i++) {
        let trackToAdd = this.state.tracks[Math.floor(Math.random()*this.state.tracks.length)];
        possibleTracks.splice(Math.floor(Math.random()*(possibleTracks.length + 1)), 0, [trackToAdd, false])
      }
      
      blindtestBody =
        <div>
          <h2>Round number {this.state.round}</h2>
          <BlindtestRound 
            tracks={possibleTracks}
            url={rightTrack.audioLink}
            onResponse={this.hasAnswered}
          />
        </div>
    }
    else {
      blindtestBody = <h2> You have finished the blindtest </h2>
    }
    return(
      <div>
        {blindtestBody}
        <h2> Your score is {this.state.score}</h2>
      </div>
    )
  }
}

class BlindtestRound extends React.Component {
  constructor(props) {
    super(props);
    this.hasAnswered = this.hasAnswered.bind(this);
  }

  hasAnswered(event) {
    if(event.target.value === "true") {
      this.props.onResponse(true);
    }
    else {
      this.props.onResponse(false);
    }
  }

  render() {
    const tracks = this.props.tracks;
    let tracksChoice = [];
    for(let i = 0; i < tracks.length; i++) {
      tracksChoice.push(<button onClick={this.hasAnswered} value={tracks[i][1]}>{tracks[i][0].artist} - {tracks[i][0].name}</button>)
    }

    return(
      <div>
        <TrackPlayer url={this.props.url}/>
        {tracksChoice}
      </div>
    )
  }
}

class TrackPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.changePlayMode = this.changePlayMode.bind(this);
    this.resetTrack = this.resetTrack.bind(this);
    this.state = { playStatus : Sound.status.PLAYING, playMessage : "PAUSE"};
  }

  changePlayMode() {
    if(this.state.playStatus === Sound.status.PLAYING) {
      this.setState({ playStatus : Sound.status.PAUSED, playMessage : "PLAY"});
    } else {
      this.setState({ playStatus : Sound.status.PLAYING, playMessage : "PAUSE"});
    }
  }

  resetTrack() {
    this.setState({ playStatus : Sound.status.STOPPED, playMessage : "PLAY"});
  }

  render() {
    const urlToPlay = this.props.url;
    
    return (
      <div className="trackPlayer">
        <Sound url={urlToPlay} playStatus={this.state.playStatus}/>
        <button onClick={this.changePlayMode}>{this.state.playMessage}</button>
        <button onClick={this.resetTrack}>RESET TRACK</button>
      </div>
    );
  }
}

function TrackItem(props) {
  // Correct! There is no need to specify the key here:
  return (
    <tr>
      <td>{props.track.id}</td>
      <td>{props.track.name}</td>
      <td>{props.track.artist}</td> 
      <td>{props.track.audioLink}</td>
    </tr>
  );
}

function TrackTable(props) {
  const tracks = props.tracks;
  const trackItems = tracks.map((track) =>
    // Correct! Key should be specified inside the array.
    <TrackItem key={track.id}
              track={track} />

  );
  return (
    <table>
     <tbody>
        <tr>
          <th>Track ID</th>
          <th>Name</th>
          <th>Artist</th> 
          <th>Audio Link</th>
        </tr>
        {trackItems}
      </tbody>
    </table>
  );
}

function extractTracksDatas(response) {
  let data = JSON.parse(response)
  let dataToReturn = [];
  if(data.items === undefined) {
    return dataToReturn;
  }
  for(let i = 0; i < data.items.length; i++) {
    let dataToAdd = { 
      id : data.items[i]["track"]["id"],
      name : data.items[i]["track"]["name"],
      artist : data.items[i]["track"]["artists"][0]["name"],
      audioLink : data.items[i]["track"]["preview_url"]
    };
    dataToReturn.push(dataToAdd);
  }
  return dataToReturn;
}

export default App;
