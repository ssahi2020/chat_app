import React from "react"
import ChannelList from "../components/ChannelList"
import ChannelView from "../components/ChannelView"
import ReplyThread from "../components/ReplyThread"
import { Link } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"

class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      in_thread: false,
      clicked_channel: null,
      clicked_thread_id: null,
      clicked_message: null,
    }
  }

  renderMessages = (channel) => {
    console.log(this.state.in_thread)
    this.setState({ clicked_channel: channel })
  }

  renderThread = (msg) => {
    console.log(msg)
    this.setState({
      in_thread: true,
      clicked_thread_id: msg["message_id"],
      clicked_message: msg["body"],
    })
  }

  render() {
    return (
      <div className="Channel-Cols">
        <div>
          <ChannelList renderMessages={this.renderMessages} />
        </div>
        <div
          className={this.state.in_thread ? "Skinny-Message-View" : "Full-Message-View"}
        >
          <ChannelView
            in_thread={this.state.in_thread}
            clicked_channel={this.state.clicked_channel}
            renderThread={this.renderThread}
          />
        </div>
        {this.state.in_thread && (
          <ReplyThread
            clicked_channel={this.state.clicked_channel}
            thread_id={this.state.clicked_thread_id}
            message={this.state.clicked_message}
          />
        )}
      </div>
    )
  }
}

export default Channel
