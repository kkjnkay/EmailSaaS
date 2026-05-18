const axios = require("axios");

async function validateEmail(email) {
  try {
    // Безкоштовна API (наприклад mailcheck.p.rapidapi.com, 1000 запитів/міс.)
    const options = {
      method: 'GET',
      url: 'https://mailcheck.p.rapidapi.com/',
      params: { email },
      headers: {
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'mailcheck.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const { is_valid_format, is_disposable, is_mx_found } = response.data;

    return is_valid_format.value && is_mx_found.value && !is_disposable.value;
  } catch (error) {
    console.error(`Error validating ${email}:`, error.message);
    return false;
  }
}

module.exports = { validateEmail };
