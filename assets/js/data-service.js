export async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

export async function loadAppData() {
  const [config, elements, applications, articles, gallery, media, sources] = await Promise.all([
    fetchJSON('./data/site-config.json'),
    fetchJSON('./data/elements.json'),
    fetchJSON('./data/applications.json'),
    fetchJSON('./data/articles.json'),
    fetchJSON('./data/gallery.json'),
    fetchJSON('./data/media.json'),
    fetchJSON('./data/sources.json'),
  ]);

  return { config, elements, applications, articles, gallery, media, sources };
}

export async function loadTranslations() {
  const [el, en] = await Promise.all([
    fetchJSON('./data/translations/el.json'),
    fetchJSON('./data/translations/en.json'),
  ]);

  return { el: { translation: el }, en: { translation: en } };
}
