import React from "react"
import { Link, Redirect } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: null,
      password: null,
      toChannel: false,
      attempt: false,
    }
  }

  changeUsername = (e) => {
    this.setState({ username: e.target.value })
  }

  changePassword = (e) => {
    this.setState({ password: e.target.value })
  }

  logIn = async () => {
    await this.setState({ loading: true })
    localStorage.clear()
    let loginResponse = await fetch("/api/login", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    })

    if (loginResponse.status === 200) {
      const loginResult = await loginResponse.json()
      console.log(loginResult)
      localStorage.setItem("user_id", loginResult.user_id)
      localStorage.setItem("username", loginResult.username)
      localStorage.setItem("email", loginResult.email)
      localStorage.setItem("first_name", loginResult.first_name)
      localStorage.setItem("last_name", loginResult.last_name)

      this.props.logUserIn()
      this.setState({ toChannel: true })
    } else {
      this.setState({ attempt: true })
    }
  }

  render() {
    if (this.state.toChannel === true) {
      return <Redirect to="/channel" />
    }
    return (
      <div
        className="App-login"
        style={{
          border: "1px solid black",
          width: "75%",
          margin: "auto",
          maxWidth: "300px",
          minWidth: "200px",
        }}
      >
        <div style={{ textAlign: "center", margin: "auto" }}>
          <Row>
            <label>Username</label>
            <Input
              type="text"
              placeholder="username"
              size="large"
              onChange={this.changeUsername}
            />
          </Row>
          <Row>
            <label>Password</label>
            <Input type="password" size="large" onChange={this.changePassword} />
          </Row>
          <div>
            <Button type="primary" onClick={this.logIn}>
              Log In
            </Button>
          </div>
        </div>
        <div style={{ fontSize: "12px", marginBottom: "8px" }}>
          <Link to="/signup">Sign Up</Link>
          <br />
          <Link to="/forgotpwd">Forgot Password?</Link>
        </div>
        {this.state.attempt ? <p>Wrong Username/Password Combo</p> : null}
      </div>
    )
  }
}

export default Login
