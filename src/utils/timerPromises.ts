export async function setTimeout(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}