import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Funnel / email capture */}
        <Route path="/" element={<ComingSoon />} />

        {/* App experience */}
        <Route path="/home" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Layout>
  );
}
