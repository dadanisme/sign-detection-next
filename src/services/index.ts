import axios from "axios";

const token = process.env.NEXT_PUBLIC_OPENAI_TOKEN;

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const getCompletion = async (prompt: string): Promise<string> => {
  const response = await openai.post("/completions", {
    model: "text-davinci-003",
    prompt: `buat kalimat dari kata di bawah ini, jika kata dalam bahasa asing, terjemahkan ke bahasa indonesia:\n\n"${prompt}"`,
    max_tokens: 100,
    temperature: 0.9,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
  });

  return response.data.choices[0].text;
};

export const speak = async (text: string) => {
  const instance = new SpeechSynthesisUtterance();
  instance.text = text;
  instance.lang = "id-ID";

  instance.voice = speechSynthesis.getVoices().filter(function (voice) {
    return voice.name == "Google Indonesia";
  })[0];

  instance.rate = 0.9;
  instance.onend = function (event) {
    // alert("Finished in " + event.elapsedTime + " seconds.");
  };
  speechSynthesis.speak(instance);
};
