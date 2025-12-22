// import React, { useState } from "react";
// import Sidebar from "../components/Sidebar";

// export default function Layout({ children }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   return (
//     // <div 
//     // className="flex"
//     // >
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//       {/* Sidebar */}
//       {/* <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}
//       <Sidebar/>

//       {/* Main Content */}
//       {/* <main
//         className={`transition-all duration-300 w-full min-h-screen
//           ${isCollapsed ? "ml-20" : "ml-64"}
//         `}
//       > */}
//       <main className="flex-1 overflow-auto p-6">
//         {children}
//       </main>
//     </div>
//   );
// }

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar controlled from Layout */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-auto p-6 transition-all duration-300
          ${isCollapsed ? "ml-20" : "ml-64"}
        `}
      >
        {children}
      </main>
    </div>
  );
}

