import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

async function main() {
  const result = await hf.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      {
        role: "user",
        content: "What is diabetes?"
      }
    ]
  });

  console.log(result.choices[0].message.content);
}

main().catch(console.error);