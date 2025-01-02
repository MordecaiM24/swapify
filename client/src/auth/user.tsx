import Login from "./login";
import Profile from "./profile";

export default function User() {
  return <>{localStorage.getItem("user") ? <Profile /> : <Login />}</>;
}
