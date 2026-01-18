const getConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'verifications';

  return { url, key, bucket };
};

export const hasSupabaseStorageConfig = () => {
  const { url, key } = getConfig();
  return !!url && !!key;
};

const getAuthHeaders = () => {
  const { key } = getConfig();
  return {
    authorization: `Bearer ${key}`,
    apikey: key,
  };
};

export const uploadObject = async ({ bucket, objectPath, body, contentType }) => {
  const { url } = getConfig();
  const authHeaders = getAuthHeaders();

  const endpoint = `${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase upload failed (${res.status}): ${text || res.statusText}`);
  }

  return true;
};

export const createSignedUrl = async ({ bucket, objectPath, expiresIn = 600 }) => {
  const { url } = getConfig();
  const authHeaders = getAuthHeaders();

  const endpoint = `${url.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${objectPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase signed URL failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  const signedPath = data?.signedURL;
  if (!signedPath) {
    throw new Error('Supabase signed URL response missing signedURL');
  }

  // signedURL is a path like /object/sign/...; make it absolute
  return `${url.replace(/\/$/, '')}/storage/v1${signedPath}`;
};

export const deleteObject = async ({ bucket, objectPath }) => {
  const { url } = getConfig();
  const authHeaders = getAuthHeaders();

  const endpoint = `${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase delete failed (${res.status}): ${text || res.statusText}`);
  }

  return true;
};

