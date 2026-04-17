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
  const audioContextRef = useRef(null);
  const synthRef = useRef(null);

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
        add_classes: true,
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

    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Stop any previous playback
    stopMusic();

    try {
      // Simplified playback using ABCJS with direct MIDI
      const visualObj = ABCJS.renderAbc(svgRef.current, abcCode, {
        staffwidth: 700,
        scale: 1.0,
        midi: {
          generateDownload: false,
          synth: {
            useSynth: true,
            soundFont: 'https://paulrosen.github.io/abcjs/soundfont/',
            audioContext: audioContextRef.current
          }
        }
      });

      if (visualObj && visualObj.midi) {
        setIsPlaying(true);
        visualObj.midi.start();
      } else {
        console.error('Could not initialize MIDI playback');
        alert('Não foi possível iniciar a reprodução. A biblioteca ABCJS pode não estar a carregar corretamente.');
      }
    } catch (error) {
      console.error('Error in playback:', error);
      alert('Erro ao processar o código ABC. Verifique a sintaxe ou tente outro exemplo.');
    }
  };

  const stopMusic = () => {
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  // Render music on component mount and when abcCode changes
  React.useEffect(() => {
    renderMusic();
  }, [abcCode]);

  return (
    <div className="app">
      <header>
        <h1>🎵 ABC Music Player</h1>
        <p>Insira ou carregue um ficheiro com código ABC para tocar música</p>
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
            placeholder="Insira o código ABC aqui...
Exemplo:
X:1
T:Mary Had a Little Lamb
M:6/8
L:1/8
K:C
E D C | D C E | E E E | D D D |
E D C | D C E | E E E2 | C C C ||"
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
        <p><strong>Dica:</strong> Pode encontrar exemplos de código ABC em <a href="https://abcnotation.com/wiki/abc:standard:v2.1" target="_blank" rel="noopener noreferrer">ABC Standard</a></p>
      </div>
    </div>
  );
}

export default App;