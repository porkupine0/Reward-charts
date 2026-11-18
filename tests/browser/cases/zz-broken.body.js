  // DELIBERATELY BROKEN (to prove CI turns red); reverted in the next commit
  await visit('index.html', 'broken');
  check(false, 'deliberately broken check');
