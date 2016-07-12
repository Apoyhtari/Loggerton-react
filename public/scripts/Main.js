
var Comment = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children, {sanitize: true});
    
    return {__html: rawMarkup};
  },

  render: function() {

    return (
      <div className="comment">
        <h4 className="commentAuthor">
          {this.props.author}
        </h4>
          <p>{this.props.timestamp}</p>
          <p id="tags">{this.props.tag}</p>
      </div>
    );

  }
});


var CommentBox = React.createClass({
   loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;

    comment.id = Date.now();
    comment.timestamp = Date();
    var newComments = comments.concat([comment]);

    this.setState({data: newComments});

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});

      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

   getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
   this.loadCommentsFromServer();
   setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  render: function() {
    return (
      <div className="commentBox col-md-12">
        <h1> Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        <Comment />


      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id} timestamp={comment.timestamp} tag={comment.tag}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="container commentContainer">
        <div className="row">
          <div className="commentList col-md-12">
       
       {commentNodes}
          </div>
        </div>
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: '', tag: ''};
  },
  handleAuthorChange: function(e) {
    
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    
    this.setState({text: e.target.value});
  },
  handleTagChange: function(e) {
    
    this.setState({tag: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    var tag = this.state.tag.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, tag: tag});
    this.setState({author: '', text: '', tag: ''});
  },
  render: function() {
    return (
      <div className="container inputContainer">
        <div className="row clearfix">
          <form className="commentForm col-md-8" onSubmit={this.handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              value={this.state.author}
              onChange={this.handleAuthorChange}/>
            <input
             type="text"
              placeholder="Say something..."
              value={this.state.text}
              onChange={this.handleTextChange}/>

        
            <input type="text"
              placeholder="tag"
              value={this.state.tag}
              onChange={this.handleTagChange}/>
            <input type="submit" value="Post" />
          </form>
        </div>
      </div>
    );
  }
});

var data = [
  {id: 1, author: "Pete Hunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
];

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={5000}/>,
  
  document.getElementById('content')
);