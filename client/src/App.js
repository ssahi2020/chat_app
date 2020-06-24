//Thanks to help from Trace Sauter, Sauhard Sahi, Trevor Austin, and many sleepless nights on stackoverflow

import React from "react"
import "./App.css"
import Header from "./components/Header"
import NotFound from "./components/NotFound"
import Login from "./components/Login"
import Logout from "./components/Logout"
import SignUp from "./components/SignUp"
import Channel from "./components/Channel"
import { isSignedIn } from "./components/utils"
import { BrowserRouter, Route, Switch } from "react-router-dom"

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loggedIn: false, //check local storage to see if signed in
    }

    this.updateLoginStatus = this.updateLoginStatus.bind(this)
  }

  updateLoginStatus = () => {
    this.setState({ loggedIn: isSignedIn() })
  }

  render() {
    return (
      <BrowserRouter>
        <div className="Container">
          <Header />
          <Switch>
            <div className="Channel-Container">
              <Route
                exact
                path="/"
                key="home"
                render={(props) => <SignUp logUserIn={this.updateLoginStatus} />}
              />
              <Route
                path="/login"
                key="login"
                render={(props) => <Login logUserIn={this.updateLoginStatus} />}
              />
              <Route path="/channel" key="channel" render={(props) => <Channel />} />
              <Route
                path="/signup"
                key="signup"
                render={(props) => <SignUp logUserIn={this.updateLoginStatus} />}
              />
              <Route
                path="/logout"
                key="logout"
                render={(props) => <Logout logUserOut={this.updateLoginStatus} />}
              />
            </div>
            <Route component={NotFound} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App
