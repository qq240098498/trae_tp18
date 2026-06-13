import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Shop from "@/pages/Shop";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </Router>
  );
}
