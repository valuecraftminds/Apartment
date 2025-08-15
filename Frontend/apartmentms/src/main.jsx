// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import './index.css'

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContext } from "./contexts/AuthContext";

function Root() {
  const [auth, setAuth] = useState(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <App />
    </AuthContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);


// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
