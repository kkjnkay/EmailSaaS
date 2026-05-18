// utils/mergeTags.js
function replaceMergeTags(template, lead) {
  if (!template || typeof template !== 'string') return template;
  if (!lead || typeof lead !== 'object') return template;

  return template
    .replace(/{{\s*firstName\s*}}/gi, lead.firstName || '')
    .replace(/{{\s*lastName\s*}}/gi, lead.lastName || '')
    .replace(/{{\s*company\s*}}/gi, lead.company || '')
    .replace(/{{\s*email\s*}}/gi, lead.email || '');
}

module.exports = { replaceMergeTags };
