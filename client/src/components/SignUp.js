import React from "react"
import { Link, Redirect } from "react-router-dom"
import { Input, Button, Row, Col } from "antd"

class SignUp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: null,
      password: null,
      confirmation: null,
      first_name: null,
      last_name: null,
      email: null,
      toChannel: false,
    }
  }

  changeUsername = (e) => {
    this.setState({ username: e.target.value })
  }
  changePassword = (e) => {
    this.setState({ password: e.target.value })
  }
  changeConfirmation = (e) => {
    this.setState({ confirmation: e.target.value })
  }
  changeFirstName = (e) => {
    this.setState({ first_name: e.target.value })
  }
  changeLastName = (e) => {
    this.setState({ last_name: e.target.value })
  }
  changeEmail = (e) => {
    this.setState({ email: e.target.value })
  }

  signUp = async () => {
    await this.setState({ loading: true })
    localStorage.clear()
    console.log("hi!")
    const signupResponse = await fetch("/api/signup", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin", //allows to pass session cookie between client and server
      method: "post",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        confirmation: this.state.confirmation,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
      }),
    })

    if (signupResponse.status === 200) {
      console.log("signed up")
    }

    const loginResponse = await fetch("/api/login", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
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
      console.log("LOGIN FAILED")
    }

    this.props.logUserIn()
  }

  render() {
    if (this.state.toChannel === true) {
      return <Redirect to="/channel" />
    }
    return (
      <div
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
            <label> First Name </label>
            <Input
              type="text"
              placeholder="First Name"
              size="large"
              onChange={this.changeFirstName}
            />
          </Row>
          <Row>
            <label> Last Name </label>
            <Input
              type="text"
              placeholder="Last Name"
              size="large"
              onChange={this.changeLastName}
            />
          </Row>
          <Row>
            <label> Email </label>
            <Input
              type="text"
              placeholder="Last Name"
              size="large"
              onChange={this.changeEmail}
            />
          </Row>
          <Row>
            <label>Password</label>
            <Input type="password" size="large" onChange={this.changePassword} />
          </Row>
          <Row>
            <label>Confirm Password</label>
            <Input type="password" size="large" onChange={this.changeConfirmation} />
          </Row>
          <div>
            <Button type="primary" onClick={this.signUp}>
              Sign Up and Log In
            </Button>
          </div>
        </div>
        <div style={{ fontSize: "12px", marginBottom: "8px" }}></div>
      </div>
    )
  }
}

export default SignUp
