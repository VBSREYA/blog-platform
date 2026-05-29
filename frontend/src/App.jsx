import {
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import EditPost from "./pages/EditPost";
import Profile from "./pages/Profile";

function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute
              user={user}
            >
              <CreatePost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute
              user={user}
            >
              <EditPost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:id"
          element={
            <PostDetails />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              user={user}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={<Profile />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
