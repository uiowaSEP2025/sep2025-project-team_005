module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // It seems as though us-east-2 is default so generating the presigned link (even with a client with the us-east-2 region)
    // doesn't include the region in the url, hence the second domain
    domains: ['savvy-note-images.s3.us-east-2.amazonaws.com', 'savvy-note-images.s3.amazonaws.com'],
  },
};

