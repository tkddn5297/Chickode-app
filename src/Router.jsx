// src/Router.jsx
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Quiz from './quiz'; // [수정] Play 대신 quiz.jsx를 가져옵니다.

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      {/* 주소 /play로 들어오면 Quiz 컴포넌트를 보여줍니다. */}
      <Route path="/play" element={<Quiz />} />
    </Routes>
  );
}