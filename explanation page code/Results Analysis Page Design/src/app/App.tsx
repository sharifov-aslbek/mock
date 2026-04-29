import { Header } from "./components/Header";
import { ResultsPage } from "./components/ResultsPage";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="flex flex-col" style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Header />
      <ResultsPage />
      <Footer />
    </div>
  );
}