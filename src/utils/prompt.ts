const prompts = [
  {
    prompt:
      "Write down three important things you need to accomplish today, and what steps you'll take to achieve them.",
    placeholder:
      "1. \n- Step 1: \n- Step 2: \n- Step 3: \n\n2. \n- Step 1: \n- Step 2: \n- Step 3: \n\n3. \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down three interesting things you learned today, and why they stood out to you.",
    placeholder:
      "1. \n- Interesting thing: \n- Why it stood out: \n\n2. \n- Interesting thing: \n- Why it stood out: \n\n3. \n- Interesting thing: \n- Why it stood out: ",
  },
  {
    prompt:
      "Write down a question you need to answer, and what steps you'll take to find the answer.",
    placeholder:
      "Question: \n\nSteps to find the answer: \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down a new idea you had today, and how you plan to execute it.",
    placeholder:
      "New idea: \n\nExecution plan: \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down a task you've been procrastinating on, why you've been avoiding it, and what steps you'll take to finally get it done.",
    placeholder:
      "Task: \n\nReasons for procrastinating: \n- Reason 1: \n- Reason 2: \n- Reason 3: \n\nSteps to get it done: \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down something you want to research further, and what steps you'll take to start your research.",
    placeholder:
      "Topic to research: \n\nSteps to start research: \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down a quote that inspired you today, and why it resonated with you.",
    placeholder: "Quote: \n\nWhy it resonated with you: ",
  },
  {
    prompt:
      "Write down a goal you have for this week, why it's important to you, and what steps you'll take to achieve it.",
    placeholder:
      "Goal: \n\nWhy it's important to you: \n\nSteps to achieve it: \n- Step 1: \n- Step 2: \n- Step 3: ",
  },
  {
    prompt:
      "Write down a conversation you had today that stuck with you, and why it made an impact on you.",
    placeholder: "Conversation: \n\nWhy it made an impact on you: ",
  },
  {
    prompt:
      "Write down a task you accomplished today, how you completed it, and how it contributed to your overall goals.",
    placeholder:
      "Accomplished task: \n\nHow you completed it: \n- Step 1: \n- Step 2: \n- Step 3:",
  },
];

export const getRandomPrompt = () => {
  const rand = Math.floor(Math.random() * prompts.length);

  return prompts[rand];
};
