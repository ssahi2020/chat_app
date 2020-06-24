import React from "react"
import { Redirect } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"

class ChannelList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newChannel: null,
      user_id: localStorage.getItem("user_id"),
      channel_list: [],
    }
  }

  componentDidMount() {
    this.pollForChannels()
    this.interval = setInterval(() => this.pollForChannels(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  changeChannelName = (e) => {
    this.setState({ newChannel: e.target.value })
  }

  pollForChannels = () => {
    // console.log("querying channel names & views")

    fetch("/api/channels/view", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ channel_list: data })
        console.log(data)
        // this.pollForChannels()
      })
  }

  newChannel = () => {
    console.log("inserting new channel")

    fetch("/api/channels/create", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      method: "post",
      body: JSON.stringify({
        name: this.state.newChannel,
        user_id: localStorage.getItem("user_id"),
      }),
    }).then(() => this.pollForChannels())
  }

  chooseChannel = (e) => {
    console.log("clicked", e)
    this.props.renderMessages(e)
  }

  deleteChannel = (e) => {
    console.log("to delete", e)
    fetch("/api/channels/delete", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      method: "post",
      body: JSON.stringify({
        name: e,
        user_id: localStorage.getItem("user_id"),
      }),
    }).then((response) => {
      if (response.status !== 200) {
        console.log("user cannot delete channel")
      } else {
        this.pollForChannels()
      }
    })
  }

  render() {
    const channels = this.state.channel_list.map((channel) => (
      <div className="Channel-Row">
        <div
          className="Channel-Column"
          style={{ cursor: "pointer" }}
          onClick={() => this.chooseChannel(channel["name"])}
        >
          {" "}
          {channel["name"]}{" "}
        </div>
        <div
          className="Channel-Column"
          style={{ cursor: "pointer" }}
          onClick={() => this.deleteChannel(channel["name"])}
        >
          Delete
        </div>
        <div className="Channel-Column">{channel["unread_messages"]}</div>
      </div>
    ))

    return (
      <div>
        <Row>
          <label>Enter Channel Name</label>
          <Input
            type="text"
            placeholder="Channel Name"
            size="large"
            onChange={this.changeChannelName}
          />
          <Button
            style={{ cursor: "pointer" }}
            type="primary"
            onClick={() => this.newChannel()}
          >
            Create Channel
          </Button>
        </Row>
        <div id="channelspace"> {channels}</div>
      </div>
    )
  }
}

export default ChannelList
