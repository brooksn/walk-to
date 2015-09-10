import React, { PropTypes } from 'react';
import styles from './Shp2pgsqlPage.css';
import Dispatcher from '../../core/Dispatcher.js';
import Dropzone from 'react-dropzone';
import withStyles from '../../decorators/withStyles';
import request from 'superagent';
import ShapeStore from '../../stores/ShapeStore.js'

var shapefilePostResponse = function(err, res) {
  let downloadurl = res.headers['shapefile-location'];
  Dispatcher.dispatch({
    //actionType: 'receivedSQLstring',
    actionType: 'receivedSQLurl',
    url: downloadurl
  });
}

@withStyles(styles)
class Shp2pgsqlPage extends React.Component {
  
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.state = {
      buttontext: 'nothing to download',
      buttonenabled: false,
      downloadurl: false
    };
  }
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  
  testbool = false;
  
  componentDidMount() {
    var self = this;
    ShapeStore.addChangeListener(self.onChange.bind(self));
  }
  
  onChange(newstate) {
    if (newstate.downloadurl) {
      newstate.buttontext = 'download';
      newstate.buttonenabled = true;
    }
    this.setState(newstate);
  }
  
  makeSqlFile(){
    //ShapeStore
    return {
      mime: 'application/octet-stream'
    };
  }
  
  render() {
    let title = 'Convert Shapefile to PostGIS';
    this.context.onSetTitle(title);
    let buttontext = this.state.downloadurl ? 'Download SQL' : 'nothing to download :(';
    let buttondisabled = this.state.downloadurl ? false : true;
    let downloadformaction = this.state.downloadurl ? this.state.downloadurl : '#';
    return (
      <div className="Shp2pgsqlPage">
        <div className="Shp2pgsqlPage-container">
          <h1>{title}</h1>
          <Dropzone onDrop={this.onDrop}>
            <div>Include at least a .shp and .dbf file. Drag and drop them here, or click to select shapefile components to upload.</div>
          </Dropzone>
          <form method="get" action={downloadformaction}>
            <button className="sql-download-button" disabled={buttondisabled} type="submit">{buttontext}</button>
          </form>
        </div>
      </div>
    );
  }

  onDrop(files) {
      var req = request.post('/shp2pgsql_upload');
      files.forEach((file)=> {
        console.log('filename: ' + file.name);
        req.attach('shapefile', file, file.name);
      });
      //this.testbool = true;
      //^^TypeError: Attempted to assign to readonly property.
      req.end(shapefilePostResponse);
    }

}

export default Shp2pgsqlPage;
