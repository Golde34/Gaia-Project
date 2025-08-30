export function runInBackground(task: () => Promise<any>) {
  task().catch(err => console.error("bg task error:", err));
}
