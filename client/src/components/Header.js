import React from "react"
import Belayer from "../imgs/belayer.png"
import { isSignedIn } from "../components/utils"
import Logout from "../components/Logout"
import { Button } from "antd"
import { withRouter } from "react-router-dom"

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  logOutlogIn = () => {
    console.log(isSignedIn())
    if (isSignedIn()) {
      this.props.history.push("/logout")
      console.log("pushed to logout")
    }
  }
  render() {
    return (
      <div
        className="App-header"
        style={{
          backgroundImage: `url(${Belayer})`,
          height: "100px",
          paddingTop: 0,
          marginTop: 0,
        }}
      >
        <Button
          style={{
            width: "84px",
            height: "45px",
            float: "right",
          }}
          onClick={() => this.logOutlogIn()}
        >
          {" "}
          {isSignedIn() ? "Log Out" : "Log In"}{" "}
        </Button>
        <h1
          style={{
            fontSize: "50pt",
            textAlign: "center",
            color: "white",
            maxHeight: "100px",
            paddingTop: 0,
            marginTop: 0,
          }}
        >
          Belay
        </h1>
      </div>
    )
  }
}

export default withRouter(Header)
