interface CaptchaEnvelope {
  data: {
    captchaId: string;
    prompt: string;
  };
}

export function solvePromptHubCaptchaPrompt(prompt: string): string {
  const match = prompt.match(/^\s*(\d+)\s*([+-])\s*(\d+)\s*=\s*\?\s*$/);
  if (!match) {
    throw new Error(`Unsupported PromptHub captcha prompt: ${prompt}`);
  }

  const left = Number(match[1]);
  const operator = match[2];
  const right = Number(match[3]);
  return String(operator === "+" ? left + right : left - right);
}

export async function issueSolvedPromptHubCaptcha(baseUrl: string): Promise<{
  captchaId: string;
  captchaAnswer: string;
}> {
  const response = await fetch(`${baseUrl}/api/auth/captcha`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to issue PromptHub captcha: ${response.status} ${text}`,
    );
  }

  const payload = (await response.json()) as CaptchaEnvelope;
  return {
    captchaId: payload.data.captchaId,
    captchaAnswer: solvePromptHubCaptchaPrompt(payload.data.prompt),
  };
}
