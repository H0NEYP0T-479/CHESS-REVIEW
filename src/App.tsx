import Board from './components/Board'

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      paddingTop: '20px'
    }}>
      <div>
        <h1 style={{ textAlign: 'center' }}>Shoaib's Chess Analyzer</h1>
        <Board />
      </div>
    </div>
  )
}

export default App