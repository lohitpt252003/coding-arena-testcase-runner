import axios from 'axios';

/**
 * Function to execute code in a specific language.
 * @param {string} language - Language in which code is written (cpp, python, etc.).
 * @param {string} code - The code to be executed.
 * @param {string} input - Input to the code (if any).
 * @returns {Promise<Object>} - A promise that resolves with an object containing the output and status.
 */
const executeCode = async (language, code, input = '') => {
  try {
    // Map language to file extensions
    const extensionMap = {
      cpp: 'cpp',
      c: 'c',
      python: 'py',
      java: 'java',
      javascript: 'js',
    };

    // Construct the request body
    const requestBody = {
      language,
      version: '*', // Use the latest version available
      files: [
        {
          name: `main.${extensionMap[language] || 'txt'}`,
          content: code,
        },
      ],
      stdin: input, // Pass user input
    };

    // Make the API request
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', requestBody);
    // console.log(response);
    

    // Process the response
    if (response.data && response.data.run) {
      const { stdout, stderr } = response.data.run;
      return {
        output: stdout || stderr || 'No output.',
        status: 'success',
      };
    }
    else {
      return {
        output: 'No output received from the server.',
        status: 'failure',
      };
    }
  }
  catch (error) {
    console.error('Code execution error:', error);

    // Return error details
    return {
      output: `Error: ${error.response?.data?.error || error.message || 'Unknown error occurred.'}`,
      status: 'error',
    };
  }
};

export default executeCode;
