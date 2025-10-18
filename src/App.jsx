import { Route, Routes } from "react-router-dom"
import Loyout from "../loyout";
import FileUpload from "./pages/FileUpload";
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Loyout />}>
          {" "}
          */
          <Route index element={<FileUpload />} />
        </Route>
      </Routes>
    </>
  );
}

export default App
