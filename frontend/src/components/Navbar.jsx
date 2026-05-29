import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } =
    useAuth();

  return (
    <nav className="sticky top-0 z-20 border-b border-[#7a4826]/15 bg-[#fff8ef]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-[calc(100%_-_32px)] max-w-[1100px] items-center justify-between py-4">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-[#3f2112]"
        >
          StoryBrew
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/create"
                className="soft-button rounded-full px-4 py-2 text-sm font-semibold"
              >
                Create
              </Link>

              <Link
                to="/profile"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#5a3018] hover:bg-[#f4e4d1]"
              >
                {user.name}
              </Link>

              <button
                onClick={logout}
                className="brown-button rounded-full px-4 py-2 text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#5a3018] hover:bg-[#f4e4d1]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="brown-button rounded-full px-4 py-2 text-sm font-semibold"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
