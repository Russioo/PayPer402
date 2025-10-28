// Shared in-memory storage for generations
// In production, use a database like PostgreSQL, MongoDB, or Redis

export const generations = new Map<string, any>();

