import { Route, Routes } from "react-router-dom";
import { StoreProvider } from "./store.jsx";
import Layout from "./components/Layout.jsx";
import ListPage from "./pages/ListPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ListPage />} />
          <Route path="pokemon/:slug" element={<DetailPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}

export default App;
