import React from "react"

class MessageDisplay extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasBeenViewed: false, //add to query
      isVisible: false,
    }
  }

  render() {
    let { username, body, hasBeenViewed } = this.props.message
    return (
      <div style={{ cursor: "pointer " }} onClick={this.props.clickFunction}>
        {username}: {body}
      </div>
    )
  }
}

export default MessageDisplay
/*
      <MessageDisplay
        message={message}
        clickFunction={() => this.chooseMessage(message)}
      />
