const { env } = process;

export const HOST = env.HOST;
export const PORT = env.PORT;

export const POSTGRES_USER = env.POSTGRES_USER
export const POSTGRES_PASSWORD = env.POSTGRES_PASSWORD
export const POSTGRES_HOST = env.POSTGRES_HOST
export const POSTGRES_PORT = Number(env.POSTGRES_PORT)
export const POSTGRES_DB = env.POSTGRES_DB
// export const NODE_ENV = env.NODE_ENV
export const JWT_SECRET = env.JWT_SECRET