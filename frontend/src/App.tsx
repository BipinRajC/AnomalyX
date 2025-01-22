import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import UploadComponent from "./components/Upload";
import Analysis from "./components/Analysis";
import Query from "./components/SQLGenerator";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadComponent />} />
          <Route path="/query" element={<Query />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
