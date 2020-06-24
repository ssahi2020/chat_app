import React from "react"
import { withRouter, Link } from "react-router-dom"

class NotFound extends React.Component {
  render() {
    return (
      <div
        style={{
          border: "1px solid black",
          marginTop: "50px",
          minWidth: "250px",
          borderRadius: "0",
        }}
      >
        <h2 style={{ marginTop: "50px" }}>404 page not found </h2>
        <div style={{ fontSize: "16px", marginBottom: "8px" }}>
          Click <Link to="/">here</Link> to get back to safety
        </div>
      </div>
    )
  }
}

export default withRouter(NotFound)
