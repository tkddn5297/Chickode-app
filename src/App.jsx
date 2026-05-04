import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [multipleChoiceRatio, setMultipleChoiceRatio] = useState(50);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleChapterSelect = (chapterTitle) => {
    setSelectedChapter(chapterTitle);
    setShowChapterModal(false);
    setShowQuizModal(true);
  };

  const handleStartQuiz = () => {
    const problemCountInput = document.querySelector('.q-count-input');
    const difficultySelect = document.querySelector('.custom-select');

    const count = problemCountInput ? parseInt(problemCountInput.value) : 10;
    const difficulty = difficultySelect ? difficultySelect.value : '중 (Medium)';

    // 이제 /play로 이동하면 Router가 인식하고 Play.jsx 화면을 띄워줍니다.
    navigate('/play', { 
      state: { 
        count: count,
        ratio: multipleChoiceRatio,
        chapter: selectedChapter,
        difficulty: difficulty
      } 
    });

    setShowQuizModal(false);
  };

  return (
    <div className="main-container">
      <nav className={`navbar ${isMenuOpen ? 'open' : 'closed'}`}>
        <div className="nav-left">
          <button className="menu-toggle-btn" onClick={toggleMenu}>≡</button>
          <span className="nav-logo">CHICKODE</span>
        </div>
        <div className="nav-menu">
          <button onClick={() => window.location.reload()}>홈</button>
          <button onClick={() => setShowChapterModal(true)}>문제풀이</button>
          <button>오답노트</button>
          <button>패턴분석</button>
          <button onClick={() => navigate('/game')}>미니게임</button>
        </div>
      </nav>

      {!isMenuOpen && <button className="floating-menu-btn" onClick={toggleMenu}>≡</button>}

      <div className="header">
        <h1 className="glow-title">CHICKODE</h1>
        <p className="subtitle">초보 개발자를 위한 자바 코딩도우미</p>
      </div>

      <div className="button-wrapper">
  {/* 1. 문제풀기 */}
  <button className="btn-link" onClick={() => setShowChapterModal(true)}>
    <img src="/images/버튼_1.png" alt="문제풀기" />
  </button>
  
  {/* 2. 오답노트 */}
  <button className="btn-link">
    <img src="/images/버튼_2.png" alt="오답노트" />
  </button>
  
  {/* 3. 패턴분석 */}
  <button className="btn-link">
    <img src="/images/버튼_3.png" alt="패턴분석" />
  </button>
  
  {/* 4. 캐릭터 키우기 (커스텀 마이징) -> 버그 게임으로 연결 */}
  <button className="btn-link" onClick={() => navigate('/game')}>
    <img src="/images/버튼_4.png" alt="미니게임" />
  </button>
</div>

      {showChapterModal && (
        <div className="modal-overlay" onClick={() => setShowChapterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setShowChapterModal(false)}>×</button>
            <h2 className="modal-title">CHAPTER SELECT</h2>
            <div className="modal-divider"></div>
            <div className="chapter-section">
              <h3>Chapter 1. 자바 기초</h3>
              <div className="chapter-card" onClick={() => handleChapterSelect('자바 변수 기초')}>
                <span>01. 자바 변수 기초</span>
                <div className="progress-bg"><div className="progress-fill" style={{width:'30%'}}></div></div>
              </div>
              <div className="chapter-card" onClick={() => handleChapterSelect('자바 출력 기초')}>
                <span>02. 자바 출력 기초</span>
                <div className="progress-bg"><div className="progress-fill" style={{width:'0%'}}></div></div>
              </div>
            </div>
            <div className="chapter-section">
              <h3>Chapter 2. 자바 제어문</h3>
              <div className="chapter-card" onClick={() => handleChapterSelect('조건문')}>
                <span>03. 조건문 (if, switch)</span>
                <div className="progress-bg"><div className="progress-fill"></div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setShowQuizModal(false)}>×</button>
            <h2 className="modal-title">QUIZ SETTINGS</h2>
            <div className="modal-divider"></div>
            
            <div className="setting-item">
              <label>객관식 / 주관식 비율</label>
              <div className="range-wrapper">
                <span>객관식 {multipleChoiceRatio}%</span>
                <input 
                  type="range" 
                  className="custom-range" 
                  min="0" 
                  max="100" 
                  value={multipleChoiceRatio} 
                  onChange={(e) => setMultipleChoiceRatio(e.target.value)}
                />
                <span>주관식 {100 - multipleChoiceRatio}%</span>
              </div>
            </div>

            <div className="setting-item">
              <label>문제 수 (1~20)</label>
              <input type="number" defaultValue="10" className="custom-input q-count-input" />
            </div>

            <div className="setting-item">
              <label>난이도</label>
              <select className="custom-select">
                <option>하 (Easy)</option>
                <option selected>중 (Medium)</option>
                <option>상 (Hard)</option>
              </select>
            </div>

            <button className="start-quiz-btn" onClick={handleStartQuiz}>
              퀴즈 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}