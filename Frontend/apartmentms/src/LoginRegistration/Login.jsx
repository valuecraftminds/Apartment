import React from 'react';

export default function Login() {
  return (
    <div className="container">
      <div className="loginPage">
        <div className="loginCard animate-fadeIn">
            <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
            <h1 className="font-bold text-xl">AptSync</h1>
          </div>
          <h2>Sign In</h2>
          <form className="loginForm" action="">
            <div>
              <label htmlFor="email" className="loginLabel">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="loginInput"
              />
            </div>
            <div>
              <label htmlFor="password" className="loginLabel">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                className="loginInput"
              />
            </div>
            <div className="loginButtonGroup">
              <button type="submit" name="submit" className="loginButton loginButton--submit">
                Login
              </button>
              <button type="button" name="cancel" className="loginButton loginButton--cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
