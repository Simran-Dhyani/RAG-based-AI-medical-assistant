import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

const models = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "Qwen/Qwen2.5-7B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "google/gemma-3-4b-it"
];

for (const model of models) {
  try {
    console.log(`\nTesting ${model}`);

    const result = await hf.chatCompletion({
      model,
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ]
    });

    console.log(" Supported");
    console.log(result.choices[0].message.content);
  } catch (err) {
    console.log(" Not supported");
    console.log(err.httpResponse?.body?.error?.message || err.message);
  }
}