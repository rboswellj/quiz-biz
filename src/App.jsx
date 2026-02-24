import { useState } from 'react'
import logo from '/quiz-biz-logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>The Trivia Game!</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Login
        </button>
        <button onClick={() => setCount((count) => count + 1)}>
          Signup
        </button>
      </div>
    </>
  )
}

export default App
