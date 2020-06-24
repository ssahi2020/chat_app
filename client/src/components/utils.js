export const isSignedIn = () => {
  let user_id = localStorage.getItem("user_id")
  let username = localStorage.getItem("username")

  if (user_id && username) {
    console.log("Still signed in!")
    return true
  } else {
    console.log("signed out...")
    return false
  }
}
