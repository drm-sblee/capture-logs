import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogListPage from "./pages/LogListPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogListPage />} />
      </Routes>
    </Router>
  );
}

export default App;