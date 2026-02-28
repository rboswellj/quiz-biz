import { AuthProvider } from "./auth/AuthProvider";
import AuthGate from "./auth/AuthGate";
import Navbar from "./navbar";

import './App.css'
import Quiz from './Quiz';

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Navbar />
        <Quiz />
      </AuthGate>
    </AuthProvider>
  )
}

export default App
