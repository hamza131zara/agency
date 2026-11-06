import { randomBytes, scryptSync } from "node:crypto";
import process from "node:process";

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
  throw new Error("Run this command in an interactive terminal so the password is not echoed.");
}

const input = process.stdin;
let password = "";
process.stdout.write("Enter a private operator password (input hidden): ");
input.setRawMode(true);
input.resume();

function finish() {
  input.setRawMode(false);
  input.pause();
  input.removeAllListeners("data");
}

input.on("data", (chunk) => {
  const value = chunk.toString("utf8");
  for (const character of value) {
    if (character === "\u0003") {
      finish();
      process.stdout.write("\nCancelled.\n");
      process.exit(130);
    }
    if (character === "\r" || character === "\n") {
      finish();
      if (Buffer.byteLength(password, "utf8") < 16 || Buffer.byteLength(password, "utf8") > 1024) {
        process.stderr.write("\nPassword must be between 16 and 1024 UTF-8 bytes. No hash was created.\n");
        process.exitCode = 1;
        return;
      }
      const salt = randomBytes(16);
      const derived = scryptSync(password, salt, 64, {
        N: 1 << 15,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      });
      process.stdout.write("\nSet this value privately as AUTOMATION_OPERATOR_PASSWORD_HASH:\n");
      process.stdout.write(`${salt.toString("hex")}:${derived.toString("hex")}\n`);
      password = "";
      return;
    }
    if (character === "\u007f" || character === "\b") {
      password = Array.from(password).slice(0, -1).join("");
    } else if (character >= " ") {
      password += character;
    }
  }
});
