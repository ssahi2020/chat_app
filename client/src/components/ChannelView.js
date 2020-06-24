import React from "react"
import { Redirect } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"
// import MessageDisplay from "./MessageDisplay"

class ChannelView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newMessage: null,
      message_list: [],
    }
  }

  componentDidMount() {
    this.pollForMessages()
    this.interval = setInterval(() => this.pollForMessages(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  changeMessage = (e) => {
    this.setState({ newMessage: e.target.value })
  }

  pollForMessages = () => {
    // console.log("querying messages for clicked channel")
    // console.log(this.props.clicked_channel)
    fetch("api/channels/read/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        name: this.props.clicked_channel,
        user_id: localStorage.getItem("user_id"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        this.setState({ message_list: data }) // add to the query on the server to pull info on whether message has been viewed
      })
  }

  newMessage = () => {
    console.log("posting message")
    fetch("/api/messages/post", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        text: this.state.newMessage,
        username: localStorage.getItem("username"),
        name: this.props.clicked_channel,
      }),
    })
      .then(console.log("message posted!"))
      .then(this.pollForMessages())
  }

  chooseMessage = (e) => {
    console.log("clicked", e)
    this.props.renderThread(e)
  }

  validImage = (e) => {
    const imgRules = /(http(s?):)([/|.|\w|\s|\(\)#\:-])*\.(?:jpg|jpeg|gif|png|bmp|ico|svg|tiff|webp)/gi
    const validUrl = imgRules.exec(e)
    console.log(validUrl)
    return validUrl
  }

  render() {
    const messages = this.state.message_list.map((message) => (
      <div style={{ cursor: "pointer " }} onClick={() => this.chooseMessage(message)}>
        {message["username"]}: {message["body"]}
        <br />
        {this.validImage(message["body"]) !== null ? (
          <img src={this.validImage(message["body"])[0]} />
        ) : null}
      </div>
    ))

    if (this.props.clicked_channel === null) {
      return (
        <p style={{ textAlign: "center" }}>Click a Channel to view and post Messages!</p>
      )
    } else {
      return (
        <div>
          <Row>
            <p>Channel: {this.props.clicked_channel}</p>
            <div style={{ overflow: "scroll" }} id="chatspace">
              {" "}
              {messages}
            </div>
            <Input
              type="text"
              placeholder="Enter Message"
              size="large"
              onChange={this.changeMessage}
            />
            <Button
              style={{ cursor: "pointer" }}
              type="primary"
              onClick={() => this.newMessage()}
            >
              Post Message
            </Button>
          </Row>
        </div>
      )
    }
  }
}

export default ChannelView
