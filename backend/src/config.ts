class EnvVarError extends Error {
  constructor(configKey: string, configValue: unknown, expectedType: string) {
    super(`Failed to read process.env.${configKey}. Expected ${expectedType} but received ${configValue}`);
  }
}

const port = parseInt(process.env.PORT);

if (Number.isNaN(port)) {
  throw new EnvVarError("PORT", port, "integer");
}

const config = {
  port,
};

export default config;
