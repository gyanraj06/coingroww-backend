try {
  require.resolve('autoprefixer');
  console.log('Autoprefixer found!');
} catch (e) {
  console.error('Autoprefixer NOT found');
  process.exit(1);
}
