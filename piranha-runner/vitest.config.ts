import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "istanbul",
            include: ["src/**/**.{js,ts}"],
            exclude: ["tests"]
        },
        projects: [
            {
                plugins: [],
                test: {
                    name: "piranha-runner",
                    environment: "node",
                    clearMocks: true,
                    include: ["tests/**/**.{test,spec}.{js,ts}"],
                    setupFiles: []
                }
            }
        ]
    }
});