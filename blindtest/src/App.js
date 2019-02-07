import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { tracksLoaded : false, tracks : [] };
    this.handleTracksChange = this.handleTracksChange.bind(this);
  }

  handleTracksChange(tracksLoaded, tracks) {
    console.log('tracksLoaded :', tracksLoaded)
    console.log('tracks :', tracks)
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
      return (
        <div className="App">
          <h1>Welcome to the Spotify Blindtest</h1>
          <TrackTable tracks={tracks}/>
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
    console.log('event.target : ', event.target)
    console.log('Here we have a submit')
    console.log('this : ', this)
    if (this.state.apikey === '' || this.state.apikey === undefined || this.state.apikey === null) {
      alert('You have to put a Spotify API KEY')
      return
    }
    //request AJAX to get the datas
    let loadedtracks
    axios({
      method:'get',
      url:' https://api.spotify.com/v1/me/tracks?limit=10',
      headers: {
        "Accept" : "application/json",
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + this.state.apikey
      },
      transformResponse: [(data) => extractTracksDatas(data)]
    })
    .then(function(response) {
      console.log('response : ', response)
      loadedtracks = response.data
      console.log('loadedtracks : ', loadedtracks)
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
      <tr>
        <th>Track ID</th>
        <th>Name</th>
        <th>Artist</th> 
        <th>Audio Link</th>
      </tr>
      {trackItems}
    </table>
  );
}

function extractTracksDatas(response) {
  let data = JSON.parse(response)
  console.log('In extract, data :', data)
  console.log('In extract, data.items :', data.items)
  let dataToReturn = [];
  for(let i = 0; i < data.items.length; i++) {
    let dataToAdd = { 
      id : data.items[i]["track"]["id"],
      name : data.items[i]["track"]["name"],
      artist : data.items[i]["track"]["artists"][0]["name"],
      audioLink : data.items[i]["track"]["preview_url"]
    };
    dataToReturn.push(dataToAdd);
  }
  console.log('End of extract, dataToReturn :', dataToReturn)
  return dataToReturn;
}

export default App;
