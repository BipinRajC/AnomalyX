import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import UploadComponent from "./components/Upload";
import Analysis from "./components/Analysis";
import Chat from "./components/Chat";
import { RecoilRoot } from "recoil";
import Signup from "./components/Signup";
import Login from "./components/Login";

function App() {
  return (
    <>
      <BrowserRouter>
        <RecoilRoot>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<UploadComponent />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/Signup" element={<Signup />} />
              <Route path="/Login" element={<Login />} />
            </Routes>
          </RecoilRoot>
      </BrowserRouter>
    </>
  )
}

export default App;
