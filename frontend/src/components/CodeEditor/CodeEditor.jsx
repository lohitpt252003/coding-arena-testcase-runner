import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import { FaCopy} from "react-icons/fa";
import executeCode from '../../utils/codeExecution';
import './CodeEditor.css';

const CodeEditor = () => {
  const [testcases, setTestcases] = useState([]);
  
  const resetMessage = () => {
    let message = document.getElementById('CodeEditor-message');
    message.style.display = 'none';
  }

  const resetTestcasesColors = () => {
    for (let i = 0; i < testcases.length; i++) {
      let DIVDOM = document.getElementById(`testcase-${i}`);
      DIVDOM.classList.remove('success');
      DIVDOM.classList.remove('failure');
    }
  }

  const languageMap = {
    cpp: 'C++',
    c: 'C',
    python: 'Python',
    java: 'Java',
    javascript: 'JavaScript',
  };

  const [font, setFont] = useState(22);
  const fontArr = [];
  for (let i = 10; i < 50; i++) fontArr.push(i);

  const handleFontChange = (val) => {
    val = parseInt(val);    
    setFont(val);
  }

  const getBoilerplate = (lang) => {
    switch (lang) {
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\nint main() {\n    // cout << "Hello, World!";\n    return 0;\n}`;
      case 'c':
        return `#include <stdio.h>\nint main() {\n    // printf("Hello, World!\\n");\n    return 0;\n}`;
      case 'python':
        return `# print("Hello, World!")`;
      case 'java':
        return `public class Main {\n    public static void main(String[] args) {\n        // System.out.println("Hello, World!");\n    }\n}`;
      case 'javascript':
        return `// console.log("Hello, World!");`;
      default:
        return '// Write your code here...';
    }
  };

  const [code, setCode] = useState(getBoilerplate('cpp'));
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecutingAllTestcases, setIsExecutingAllTestcases] = useState(false);

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setOutput('');

    const result = await executeCode(language, code, input);
    if (result) {
      handleSuccess('Code executed successfully');
    }
    else {
      handleError('Error executing code');
    }
    setOutput(result.output);
    setIsExecuting(false);
    resetMessage();
    resetTestcasesColors();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(getBoilerplate(lang));
    resetMessage();
    resetTestcasesColors();
  };

  const handleAddTestcase = () => {
    setTestcases([...testcases, { input: '', expectedOutput: '', actualOutput: '' }]);
    resetMessage();
    resetTestcasesColors();
  };

  const handleDeleteTestcase = (index) => {
    resetMessage();
    resetTestcasesColors();
    setTestcases((prev) => prev.filter((_, i) => i !== index));
  }

  const handleRunTestcase = async (index) => {
    resetMessage();
    const testcase = testcases[index];
    const result = await executeCode(language, code, testcase.input);
    const updatedTestcases = [...testcases];
    updatedTestcases[index].actualOutput = result.output;
    let divDOM = document.getElementById(`testcase-${index}`);
    setTestcases(updatedTestcases);
    if (result.status ==='success') {
      handleSuccess(`Testcase ${index + 1} executed successfully`);
    }
    else {
      handleError(`Error executing testcase ${index + 1}`);
    }
    if (testcases[index].actualOutput.trim() === 'No output.') {
      testcases[index].actualOutput = '';
    }
    if (!divDOM) return false;
    if (testcases[index].expectedOutput.trim() === testcases[index].actualOutput.trim()) {
      handleSuccess(`Testcase ${index + 1} passed`);
      divDOM.classList.remove('failure');
      divDOM.classList.add('success');
      return true;
    }
    else {
      handleError(`Testcase ${index + 1} failed`);
      divDOM.classList.remove('success');
      divDOM.classList.add('failure');
      return false;
    }
    
  };

  const handleRunAllTestcases = async () => {
    setIsExecutingAllTestcases(true);
    if (testcases.length === 0) {
      handleError('No testcases found to run\nPlease add some testcases below!');
    }
    else {
      let passed = [], failed = [];
      for (let i = 0; i < testcases.length; i++) {
        let currentTestcase = await handleRunTestcase(i);
        if (currentTestcase) passed.push(i + 1);
        else failed.push(i + 1);
      }
      let total = document.getElementById('CodeEditor-total-testcase');
      let pass = document.getElementById('CodeEditor-pass-testcases');
      let fail = document.getElementById('CodeEditor-fail-testcases');
      let message = document.getElementById('CodeEditor-message');
      total.innerText = `Total Testcases: ${testcases.length}`;
      pass.innerText = `Total cases Passed: ${passed.length}`;
      fail.innerText = `Total cases Failed: ${failed.length}`;
      message.style.display = 'block';
      if (passed.length === testcases.length) {
        handleSuccess('All testcases passed');
        total.style.color = 'green';
      }
      else {
        handleError('Some testcases failed');
        total.style.color = 'red';
        fail.style.color = 'red';
      }
    }
    setIsExecutingAllTestcases(false);
  };

  const handleDeleteAllTestcases = () => {
    setTestcases([]);
    resetMessage();
  };

  const handleCopyInput = (index) => {
    navigator.clipboard.writeText(testcases[index].input).then(() => {
      handleSuccess(`Input for testcase ${index + 1} copied successfully`);
    }).catch(() => {
      handleError(`Failed to copy Input for testcase ${index + 1}`);
    });
  };
  
  const handleCopyActualOutput = (index) => {
    navigator.clipboard.writeText(testcases[index].actualOutput).then(() => {
      handleSuccess(`Actual output for testcase ${index + 1} copied successfully`);
    }).catch(() => {
      handleError(`Failed to copy Actual output for testcase ${index + 1}`);
    });
  };
  
  const handleCopyExpectedOutput = (index) => {
    navigator.clipboard.writeText(testcases[index].expectedOutput).then(() => {
      handleSuccess(`Expected output for testcase ${index + 1} copied successfully`);
    }).catch(() => {
      handleError(`Failed to copy Expected output for testcase ${index + 1}`);
    });
  };
  

  const handleSuccess = (message) => {
    toast.success(`${message}`, { autoClose: 1000 });
  };

  const handleError = (message) => {
    toast.error(`${message}`, { autoClose: 2000 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === '.') {
        handleExecuteCode();
      }
      else if (e.ctrlKey && e.key === 'Enter') {
        handleRunAllTestcases();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleExecuteCode, handleRunAllTestcases]);

  return (
    <div className="CodeEditor-container">
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar
      />
      <h1>CPH</h1>
      <div id="CodeEditor-message" style={{display: 'none'}}>
        <h1 id='CodeEditor-total-testcase'>Total Testcases: 0</h1>
        <h1 id='CodeEditor-pass-testcases' style={{color: 'green'}}>Total cases Passed: 0 </h1>
        <h1 id='CodeEditor-fail-testcases' style={{color: 'green'}}>Total cases Failed: 0 </h1>
      </div>
      <button onClick={handleAddTestcase} className="CodeEditor-addTestCase">Add a Testcase</button>
      <button onClick={handleDeleteAllTestcases} className="CodeEditor-deleteAllTestcases">Delete All Testcases</button>
      <button onClick={handleRunAllTestcases} className="CodeEditor-runAllTestcases">{isExecutingAllTestcases ? 'Running All Testcases...' : 'Run All Testcases'}</button>

      <div className="CodeEditor-testcase-container">
        {testcases.map((testcase, index) => (
          <div id={`testcase-${index}`} key={index} className="CodeEditor-testcase">
            <h2>{`Testcase ${index + 1}`}</h2>
            <textarea
              value={testcase.input}
              onChange={(e) =>
                setTestcases((prev) =>
                  prev.map((t, i) => (i === index ? { ...t, input: e.target.value } : t))
                )
              }
              rows="2"
              cols="50"
              placeholder={`Input for Testcase ${index + 1}`}
            />
            <textarea
              value={testcase.expectedOutput}
              onChange={(e) =>
                setTestcases((prev) =>
                  prev.map((t, i) => (i === index ? { ...t, expectedOutput: e.target.value } : t))
                )
              }
              rows="2"
              cols="50"
              placeholder={`Expected Output for Testcase ${index + 1}`}
            />
            <textarea
              value={testcase.actualOutput}
              readOnly
              rows="2"
              cols="50"
              placeholder={`Actual Output for Testcase ${index + 1}`}
            />
            <button onClick={() => handleRunTestcase(index)}>
              Run Testcase {index + 1}
            </button>
            <button onClick={() => handleDeleteTestcase(index)}>
              Delete Testcase {index + 1}
            </button>
            <button onClick={() => {handleCopyInput(index)}}>
              Copy Input {<FaCopy  />}
            </button>
            <button onClick={() => {handleCopyExpectedOutput(index)}}>
              Copy Expected output {<FaCopy />}
            </button>
            <button onClick={() => {handleCopyActualOutput(index)}}>
              Copy Actual output {<FaCopy />}
            </button>

          </div>
        ))}
      </div>

      

      <select 
        onChange={(e) => handleFontChange(e.target.value)} 
        value={font}
        style={{cursor: 'pointer'}} 
      >
        {fontArr.map((f) => (
          <option 
            key={f}
            style={{cursor: 'pointer'}} 
          >
            {f}
          </option>
        ))}
      </select>

      <select 
        onChange={(e) => handleLanguageChange(e.target.value)} 
        value={language}
        style={{cursor: 'pointer'}} 
      >
        {Object.keys(languageMap).map((lang) => (
          <option 
            key={lang} 
            value={lang}
            style={{cursor: 'pointer'}} 
          >
            {languageMap[lang]}
          </option>
        ))}
      </select>

      <button type="button" disabled={isExecuting} onClick={handleExecuteCode}>
        {isExecuting ? 'Code is Running...' : 'Run Code'}
      </button>

      <Editor
        theme="vs-dark"
        height="60vh"
        language={language}
        value={code}
        onChange={(newValue) => setCode(newValue || '')}
        options={{
          fontSize: font,
          fontFamily: 'Source Code Pro, Monaco, "Courier New", monospace',
          minimap: { enabled: false },
          lineNumbers: 'on',
        }}
      />
      <h3>Input</h3>
      <textarea
        rows="4"
        cols="50"
        placeholder="Enter input for your code..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <h2>Output</h2>
      <textarea
        rows="4"
        cols="50"
        placeholder="Output to your code..."
        value={output}
      />

    </div>
  );
};

export default CodeEditor;
