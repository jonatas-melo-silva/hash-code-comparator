import { useState, useEffect } from 'react';
import { createSHA256 } from 'hash-wasm';
import './App.css';

function App() {
  const [file, setFile] = useState('');
  const [listFile, setListFile] = useState([]);
  const [comparator, setComparator] = useState(false);
  const [match, setMatch] = useState('');

  const chunkSize = 64 * 1024 * 1024;
  const fileReader = new FileReader();
  let hasher = null;

  function hashChunk(chunk) {
    return new Promise((resolve, reject) => {
      fileReader.onload = async (e) => {
        const view = new Uint8Array(e.target.result);
        hasher.update(view);
        resolve();
      };

      fileReader.readAsArrayBuffer(chunk);
    });
  }

  const genareteHash = async (file) => {
    if (hasher) {
      hasher.init();
    } else {
      hasher = await createSHA256();
    }

    const chunkNumber = Math.floor(file.size / chunkSize);

    for (let i = 0; i <= chunkNumber; i++) {
      const chunk = file.slice(
        chunkSize * i,
        Math.min(chunkSize * (i + 1), file.size)
      );
      await hashChunk(chunk);
    }

    const hash = hasher.digest();
    return Promise.resolve(hash + '');
  };

  useEffect(() => {
    const fileFind = listFile.find((ele) => ele.name === file.name);
    fileFind ? setComparator(true) : setComparator(false);
  }, [file, listFile]);

  const handlerAddFile = async (event) => {
    event.preventDefault();

    if (!comparator && file) {
      const hash = await genareteHash(file);

      setListFile([
        ...listFile,
        {
          name: file.name,
          code: hash,
        },
      ]);
    }
  };

  const handlerHashComparator = async () => {
    const fileFind = listFile.find((ele) => ele.name === file.name);

    const hash = await genareteHash(file);

    if (hash === fileFind.code) {
      console.log('math');
      setMatch(hash);
    }
  };

  return (
    <div className="App">
      <div>
        <h1>Hash Comparator</h1>
        <form onSubmit={handlerAddFile}>
          <label>Arquivo: </label>
          <input
            type="file"
            name="file"
            onChange={(event) => setFile(event.target.files[0])}
          />{' '}
          {comparator ? (
            <>
              <button type="button" onClick={handlerHashComparator}>
                Comparar
              </button>
            </>
          ) : (
            <button type="submit">Adicionar</button>
          )}
          <br />
          <br />
        </form>
        {match.length > 0 ? match : 'does not match'}
      </div>
      <div className="card">
        {listFile &&
          listFile.map((file, index) => (
            <div key={index}>
              <p>Nome: {file.name}</p>
              <span>Code: {file.code}</span>
              <hr />
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
