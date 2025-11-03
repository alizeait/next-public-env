async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function LoadingTest() {
  await sleep(15000);
  return (
    <div>
      <h1>Loading Test</h1>
    </div>
  );
}
