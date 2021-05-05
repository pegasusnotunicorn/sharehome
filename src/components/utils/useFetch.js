export async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

export async function postData(url = '', data = {}) {
  const formData = jsonToFormData(data);
  const response = await fetch(url, {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json'
    // },
    // body: JSON.stringify(data)
    body: formData
  });
  return response.json();
}

function buildFormData(formData, data, parentKey) {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach(key => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    const value = data == null ? '' : data;

    formData.append(parentKey, value);
  }
}

function jsonToFormData(data) {
  const formData = new FormData();

  buildFormData(formData, data);

  return formData;
}
