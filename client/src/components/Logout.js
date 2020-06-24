import React from "react"
import { Redirect } from "react-router-dom"

class Logout extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isDone: false }
  }

  async componentDidMount() {
    console.log("logging out component")
    await fetch("/api/users/logout", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      method: "get",
    }).then(() => {
      localStorage.clear()
      this.props.logUserOut()
      this.setState({ isDone: true })
    })
  }

  render() {
    if (this.state.isDone === true) {
      return <Redirect to="/login" />
    } else {
      return <p>logging out</p>
    }
  }
}

export default Logout
