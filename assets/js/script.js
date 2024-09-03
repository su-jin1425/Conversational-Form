import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://iqelsdfschagyrngoxsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZWxzZGZzY2hhZ3lybmdveHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNTQwNDksImV4cCI6MjA0MDkzMDA0OX0.HIe9Y3M61dIqwzAGveEOC-izfiZf6zOIualUkcE4yV0';
const supabase = createClient(supabaseUrl, supabaseKey);

let formData = {
  name: '',
  email: '',
  phone: '',
  gender: '',
  address: '',
  subject: '',
  message: ''
};

const questions = [
  { key: 'name', text: "Konnichiwa.! What should I call you?", validation: value => value.length >= 2, errorMessage: "Apologies, but names need to be at least 2 characters long. Can you provide your full name?" },
  { key: 'email', text: "Share your email so we can keep the conversation going!", validation: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), errorMessage: "Oops! That email address isn’t quite right. Could you please check and resend it?" },
  { key: 'phone', text: "And your WhatsApp number?", validation: value => /^\d{10}$/.test(value), errorMessage: "It looks like the phone number isn’t formatted correctly. Can you please provide a 10-digit number without spaces or dashes?" },
  { key: 'gender', text: "What's your gender?", type: 'select', options: ['Male', 'Female', 'Other'], validation: value => ['Male', 'Female', 'Other'].includes(value), errorMessage: "I'm sorry, but I need you to select a gender option from the list: Male, Female, or Other. Could you please choose one of these?" },
  { key: 'address', text: "What's your address?", type: 'textarea', validation: value => value.length >= 10, errorMessage: "I apologize, but I need a bit more detail for the address. Could you please provide a fuller address?" },
  { key: 'subject', text: "What's your idea about in a line?", validation: value => value.length > 0, errorMessage: "I'm sorry, but I didn't catch it. Could you please provide it?" },
  { key: 'message', text: "Share your thoughts and details here", type: 'textarea', validation: value => value.length >= 20, errorMessage: "I'm sorry, but could you elaborate a bit more on your thoughts? We'd like to have at least 20 characters to better understand your needs." },
];

let currentQuestion = 0;

function addMessage(text, isUser = false, isError = false) {
  const messagesContainer = document.querySelector('.chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isUser ? 'user' : 'bot');
  if (isError) messageElement.classList.add('error');
  messageElement.textContent = text;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function askQuestion() {
  if (currentQuestion < questions.length) {
    addMessage(questions[currentQuestion].text);
    setupInput(questions[currentQuestion]);
  } else {
    addMessage("Great! Here's a summary of your information:");
    displaySummary();
    document.querySelector('.input-container').classList.add('hidden');
    document.querySelector('.action-buttons').classList.remove('hidden');
  }
}

function setupInput(question) {
  const inputContainer = document.querySelector('.input-container');
  inputContainer.innerHTML = '';

  let input;
  if (question.type === 'select') {
    input = document.createElement('select');
    input.id = 'userInput';
    question.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      input.appendChild(optionElement);
    });
  } else if (question.type === 'textarea') {
    input = document.createElement('textarea');
    input.id = 'userInput';
    input.placeholder = 'Type your message...';
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.id = 'userInput';
    input.placeholder = 'Type your message...';
  }
  inputContainer.appendChild(input);

  const button = document.createElement('button');
  button.id = 'enterButton';
  button.textContent = 'Enter';
  inputContainer.appendChild(button);

  document.getElementById('enterButton').addEventListener('click', handleUserInput);
  input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && question.type !== 'textarea') {
      handleUserInput();
    }
  });
}

function handleUserInput() {
  const userInput = document.getElementById('userInput');
  const userMessage = userInput.value.trim();

  if (userMessage) {
    const currentQuestionObj = questions[currentQuestion];
    if (currentQuestionObj.validation(userMessage)) {
      addMessage(userMessage, true);
      formData[currentQuestionObj.key] = userMessage;
      currentQuestion++;
      askQuestion();
    } else {
      addMessage(currentQuestionObj.errorMessage, false, true);
    }
  }
}

function displaySummary() {
  const table = document.createElement('table');
  const thead = table.createTHead();
  const tbody = table.createTBody();
  const headerRow = thead.insertRow();
  
  const headers = ['Field', 'Value'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  for (const [key, value] of Object.entries(formData)) {
    const row = tbody.insertRow();
    const fieldCell = row.insertCell();
    const valueCell = row.insertCell();
    fieldCell.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    valueCell.textContent = value;
  }

  const messagesContainer = document.querySelector('.chat-messages');
  messagesContainer.appendChild(table);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function submitForm() {
  console.log('Submitting form data:', formData);

  const { name, email, phone, gender, address, subject, message } = formData;

  const { data, error } = await supabase
    .from('aether-mind')
    .insert([
      { 
        Name: name,
        Email: email,
        Phone_Number: phone,
        Gender: gender,
        Address: address,
        Subject: subject,
        Message: message,
        Created_At: new Date()
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
    addMessage('There was an error submitting your message. Please try again.');
  } else {
    console.log('Data inserted successfully:', data);
    addMessage('Your message has been successfully submitted!');
  }
}

function showAlterForm() {
  const alterForm = document.createElement('div');
  alterForm.classList.add('alter-form');
  alterForm.innerHTML = `
    <label for="fieldToAlter">Select field to alter:</label>
    <select id="fieldToAlter">
      ${questions.map(q => `<option value="${q.key}">${q.key}</option>`).join('')}
    </select>
    <label for="newValue">New value:</label>
    <div id="newValueContainer"></div>
    <button id="submitAlter">Submit</button>
    <button id="doneAltering">Done</button>
  `;
  document.querySelector('.chat-messages').appendChild(alterForm);

  document.getElementById('fieldToAlter').addEventListener('change', updateNewValueInput);
  document.getElementById('submitAlter').addEventListener('click', handleAlter);
  document.getElementById('doneAltering').addEventListener('click', () => {
    alterForm.remove();
    displaySummary();
    document.querySelector('.action-buttons').classList.remove('hidden');
  });

  updateNewValueInput();
}

function updateNewValueInput() {
  const fieldToAlter = document.getElementById('fieldToAlter').value;
  const questionToAlter = questions.find(q => q.key === fieldToAlter);
  const newValueContainer = document.getElementById('newValueContainer');

  newValueContainer.innerHTML = '';
  let input;

  if (questionToAlter.type === 'select') {
    input = document.createElement('select');
    input.id = 'newValue';
    questionToAlter.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      input.appendChild(optionElement);
    });
  } else if (questionToAlter.type === 'textarea') {
    input = document.createElement('textarea');
    input.id = 'newValue';
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.id = 'newValue';
  }

  newValueContainer.appendChild(input);
}

function handleAlter() {
  const fieldToAlter = document.getElementById('fieldToAlter').value;
  const newValue = document.getElementById('newValue').value;
  const questionToAlter = questions.find(q => q.key === fieldToAlter);

  if (questionToAlter.validation(newValue)) {
    formData[fieldToAlter] = newValue;
    addMessage(`Great! I've updated ${fieldToAlter} to: ${newValue}`);
    document.getElementById('newValue').value = '';
  } else {
    addMessage(questionToAlter.errorMessage, false, true);
  }
}

document.getElementById('alterButton').addEventListener('click', function() {
  document.querySelector('.action-buttons').classList.add('hidden');
  showAlterForm();
});

document.getElementById('confirmButton').addEventListener('click', function() {
  submitForm();
  this.disabled = true;
  document.getElementById('alterButton').disabled = true;
});

// Start the conversation
askQuestion();
