import React, { useState, useRef } from 'react';
import './App.css';
import ABCJS from 'abcjs';

function App() {
  const [abcCode, setAbcCode] = useState(`X:1
T:Sample Tune
M:4/4
L:1/8
K:C
C D E F | G A B c |`);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAbcCode(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const renderMusic = () => {
    if (svgRef.current) {
      svgRef.current.innerHTML = '';
    }

    try {
      ABCJS.renderAbc(svgRef.current, abcCode, {
        staffwidth: 700,
        scale: 1.0,
      });
    } catch (error) {
      console.error('Error rendering ABC:', error);
    }
  };

  const playMusic = () => {
    if (isPlaying) {
      stopMusic();
      return;
    }

    try {
      const visualObj = ABCJS.renderAbc(svgRef.current, abcCode, {
        staffwidth: 700,
        scale: 1.0,
        midi: {
          generateDownload: false,
          synth: {
            useSynth: true,
            soundFont: 'https://paulrosen.github.io/abcjs/soundfont/'
          }
        }
      });

      if (visualObj && visualObj.midi) {
        setIsPlaying(true);
        visualObj.midi.start();
      } else {
        console.error('Could not initialize MIDI playback - visualObj:', visualObj);
        alert('⚠️ Erro: Não foi possível iniciar a reprodução.\n\nPossíveis causas:\n1. A biblioteca ABCJS não carregou corretamente\n2. O browser bloqueou a reprodução de áudio\n3. O código ABC tem erros de sintaxe\n\nTente carregar um exemplo válido de código ABC.');
      }
    } catch (error) {
      console.error('Error in playback:', error);
      alert('❌ Erro ao processar o código ABC: ' + error.message);
    }
  };

  const stopMusic = () => {
    setIsPlaying(false);
  };

  React.useEffect(() => {
    renderMusic();
  }, [abcCode]);

  return (
    <div className="app">
      <header>
        <h1>🎵 ABC Music Player</h1>
      </header>

      <div className="editor-section">
        <div className="file-upload">
          <input
            type="file"
            accept=".abc,.txt"
            onChange={handleFileUpload}
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="upload-button">
            📁 Carregar ficheiro ABC
          </label>
        </div>

        <div className="editor-container">
          <textarea
            value={abcCode}
            onChange={(e) => setAbcCode(e.target.value)}
            placeholder="Insira o código ABC aqui..."
            className="abc-editor"
          />
        </div>

        <div className="controls">
          <button
            onClick={playMusic}
            className={`play-button ${isPlaying ? 'stop' : ''}`}
            disabled={!abcCode.trim()}
          >
            {isPlaying ? '⏹️ Parar' : '▶️ Tocar Música'}
          </button>
          <button
            onClick={renderMusic}
            className="render-button"
            disabled={!abcCode.trim()}
          >
            🔄 Renderizar
          </button>
        </div>
      </div>

      <div className="music-display">
        <h2>🎼 Visualização da Música</h2>
        <div ref={svgRef} className="music-svg"></div>
      </div>

      <div className="instructions">
        <h3>📝 Como usar:</h3>
        <ol>
          <li>Carregue um ficheiro .abc ou cole código ABC na área de texto</li>
          <li>Clique em "Renderizar" para ver a pauta</li>
          <li>Clique em "Tocar Música" para ouvir a música</li>
          <li>Clique em "Parar" para interromper a reprodução</li>
        </ol>
        <p><strong>Dica:</strong> Use este exemplo:</p>
        <pre>X:1
T:Sample Tune
M:4/4
L:1/8
K:C
C D E F | G A B c |</pre>
      </div>
    </div>
  );
}

export default App;