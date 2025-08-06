async function testAsyncAwait() {
    const timer = new Promise((resolve) => setTimeout(() => resolve(), 1000));
    console.log('Waiting for the timer...');
    const result = await timer || 'i cant wait';
    console.log(result); // Output: 'time up' after 1 second
    console.log(await result); // Output: 'time up'
}

testAsyncAwait();