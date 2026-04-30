import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { javaProblems } from './data/problems'; // 상대 경로 ./ 확인[cite: 2]
import { addAttempt, getProfile } from './state/app-state'; // 상대 경로 ./ 확인[cite: 3]
import CodeMirror from '@uiw/react-codemirror';
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import './quiz.css';

// [수정] 파일명을 quiz.jsx로 하셨으니 함수 이름을 Quiz로 변경하고 export default를 추가합니다.
export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const settings = location.state || { count: 10, ratio: 50, chapter: 1, difficulty: '중 (Medium)' };
  
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [codeValue, setCodeValue] = useState('');
  const [resultStatus, setResultStatus] = useState("결과: 대기 중");
  const [resultColor, setResultColor] = useState('#d4d4d4');
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: '안녕! 첫 번째 문제야. 힘내보자 삐약!' }]);
  const [chatInput, setChatInput] = useState("");
  const chatDisplayRef = useRef(null);

  // 문제 필터링 로직[cite: 1]
  useEffect(() => {
    const { count, ratio, chapter, difficulty } = settings;
    const diffKey = typeof difficulty === 'string' ? difficulty.split(' ')[0] : '중';

    let pool = javaProblems.filter(p => 
      (p.chapter === chapter || chapter === 0) && p.difficulty === diffKey
    );

    if (pool.length === 0) pool = javaProblems;

    const objTargetCount = Math.round(count * (ratio / 100));
    const subTargetCount = count - objTargetCount;

    const objPool = pool.filter(p => p.type === 'multiple' || p.type === 'ox').sort(() => 0.5 - Math.random());
    const subPool = pool.filter(p => p.type === 'coding').sort(() => 0.5 - Math.random());

    let finalSelection = [
      ...objPool.slice(0, objTargetCount),
      ...subPool.slice(0, subTargetCount)
    ].sort(() => 0.5 - Math.random());

    setQuizList(finalSelection);
  }, [settings]);

  // 문제 이동 시 초기화 로직[cite: 1]
  useEffect(() => {
    if (quizList.length === 0) return;
    const currentProblem = quizList[currentIndex];
    setIsSubmitted(false);
    setSelectedOption(null);
    setCodeValue(currentProblem.template || '');
    setResultStatus("결과: 대기 중");
    setResultColor('#d4d4d4');
  }, [currentIndex, quizList]);

  // 자동 스크롤 로직 추가
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = () => {
    if (isSubmitted) {
      if (currentIndex + 1 < quizList.length) setCurrentIndex(currentIndex + 1);
      else navigate('/result', { state: { total: quizList.length, correct: correctCount } });
      return;
    }

    const currentProblem = quizList[currentIndex];
    let isCorrect = false;

    if (currentProblem.type !== 'coding') {
      if (!selectedOption) return alert("답을 선택해주세요!");
      isCorrect = (selectedOption === currentProblem.answer);
    } else {
      isCorrect = currentProblem.keywords.every(kw => codeValue.includes(kw));
    }

    setIsSubmitted(true);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setResultStatus("결과: 🎉 정답이야!");
      setResultColor("#55ff55");
      setChatHistory(prev => [...prev, { role: 'bot', text: "정답! 역시 대단해 삐약! 🐥" }]);
    } else {
      setResultStatus("결과: ❌ 오답입니다!");
      setResultColor("#ff5555");
      setChatHistory(prev => [...prev, { role: 'bot', text: "아쉽지만 오답이야... 다시 한 번 생각해보자! 🐣" }]);
    }
  };

  if(!quizList.length) return <div className="loading">문제를 준비 중이야 삐약...</div>;

  const currentProblem = quizList[currentIndex];

  return (
    <div className="play-view">
      <nav className="play-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>❮</button>
        <div className="nav-logo">CHICKODE</div>
        <div className="nav-right">
          <span className="chap-badge">Chapter {settings.chapter}</span>
          <span className="user-name">👤 {getProfile().name || "상우"} 님</span>
        </div>
      </nav>

      <main className="play-content">
        <div className="left-pane">
          <div className="clay-card problem-box">
            <h3 className="problem-title">
              [{currentIndex + 1}/{quizList.length}] {currentProblem.title}
            </h3>
            <p className="problem-desc">{currentProblem.desc}</p>
          </div>
          <div className="hint-area">
            <button className="hint-btn">🔓 힌트 1</button>
            <button className="hint-btn locked">🔒 힌트 2</button>
            <button className="hint-btn locked">🔒 힌트 3</button>
          </div>
          <div className="chick-character">
            <img src="/images/chick.png" alt="병아리 선배" />
            <span className="chick-label">병아리 선배 🐥</span>
          </div>
        </div>

        <div className="center-pane">
          <div className="input-area clay-card">
            {currentProblem.type === 'coding' ? (
              <div className="editor-box">
                <CodeMirror 
                  value={codeValue} 
                  height="100%" 
                  extensions={[java()]} 
                  theme={oneDark} 
                  onChange={val => setCodeValue(val)} 
                />
              </div>
            ) : (
              <div className="mcq-box">
                {currentProblem.options?.map((opt, i) => (
                  <button 
                    key={i} 
                    className={`mcq-btn ${selectedOption === opt ? 'active' : ''}`}
                    onClick={() => !isSubmitted && setSelectedOption(opt)}
                  >
                    <span className="opt-num">{i + 1}.</span> {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="terminal-box">
            <div className="term-header">
              <span>Terminal</span>
              <span className="res-status" style={{ color: resultColor }}>{resultStatus}</span>
            </div>
            <div className="term-body">
              <div className="term-line system">{`> Chickode IDE v1.0.0`}</div>
              <div className="term-line system">{`> Loading problem... [OK]`}</div>
              {isSubmitted && (
                <div className={`term-line ${resultColor === '#55ff55' ? 'success' : 'error'}`}>
                  {resultStatus}
                </div>
              )}
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            {isSubmitted ? "다음 문제로 ➔" : "제출하기"}
          </button>
        </div>

        <div className="right-pane">
          <div className="chat-box clay-card">
            <div className="chat-messages" ref={chatDisplayRef}>
              {chatHistory.map((m, i) => (
                <div key={i} className={`chat-row ${m.role}`}>
                  {m.role === 'bot' && <img src="/images/chick.png" className="mini-chick" />}
                  <div className="bubble-group">
                    <span className="sender">{m.role === 'bot' ? '병아리 선배' : '나'}</span>
                    <div className="bubble">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="병아리 선배에게 질문하기..." 
                onKeyDown={e => e.key === 'Enter' && (()=>{
                    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
                    setChatInput("");
                })()}
              />
              <button onClick={() => {
                setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
                setChatInput("");
              }}>전송</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}