import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./pages/dashboard";
import { News } from "./pages/news";
import { Jobs } from "./pages/jobs";
import { Settings } from "./pages/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "news", element: <News /> },
      { path: "jobs", element: <Jobs /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
