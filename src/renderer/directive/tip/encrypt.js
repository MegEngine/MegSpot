let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

export const encrypt = str => {
  let hash = crypto
    .createHash('sha256')
    .update(str)
    .digest('hex');
  return hash;
};
