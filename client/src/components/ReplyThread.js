import React from "react"
import { Redirect } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"

class ReplyThread extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      reply_list: [],
      reply_text: null,
    }
  }

  componentDidMount() {
    this.pollForReplies()
    this.interval = setInterval(() => this.pollForReplies(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  changeReply = (e) => {
    this.setState({ reply_text: e.target.value })
  }

  pollForReplies = () => {
    console.log(this.props.thread_id)
    fetch("/api/threads/read", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        msg_id: this.props.thread_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ reply_list: data })
        // this.pollForReplies()
      })
  }

  newReply = () => {
    console.log("posting reply:", this.state.reply_text)
    fetch("/api/threads/post", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        name: this.props.clicked_channel,
        msg_id: this.props.thread_id,
        user_id: localStorage.getItem("user_id"),
        message: this.state.reply_text,
      }),
    })
      .then(console.log("reply posted!"))
      .then(this.pollForReplies())
  }

  validImage = (e) => {
    const imgRules = /(http(s?):)([/|.|\w|\s|\(\)#\:-])*\.(?:jpg|jpeg|gif|png|bmp|ico|svg|tiff|webp)/gi
    const validUrl = imgRules.exec(e)
    console.log(validUrl)
    return validUrl
  }

  render() {
    const replies = this.state.reply_list.map((reply) => (
      <div>
        {" "}
        {reply["username"]} : {reply["body"]}
        <br />
        {this.validImage(reply["body"]) !== null ? (
          <img src={this.validImage(reply["body"])[0]} />
        ) : null}
      </div>
    ))
    return (
      <div>
        <p>Replies To: {this.props.message}</p>
        {this.validImage(this.props.message) !== null ? (
          <img src={this.validImage(this.props.message)[0]} />
        ) : null}
        <div id="replyspace">{replies}</div>
        <Input
          type="text"
          placeholder="Enter Reply"
          size="large"
          onChange={this.changeReply}
        />
        <Button
          style={{ cursor: "pointer" }}
          type="primary"
          onClick={() => this.newReply()}
        >
          Reply
        </Button>
      </div>
    )
  }
}

export default ReplyThread
